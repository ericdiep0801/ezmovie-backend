import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AdminService {
  constructor(private dataSource: DataSource) {}

  private async logAudit(action: string, tableName: string, details: any) {
    if (tableName === 'audit_logs') return;
    try {
      const repo = this.dataSource.getRepository(AuditLog);
      await repo.save({ action, tableName, details: JSON.stringify(details) });
    } catch (error) {
      console.error('Failed to save audit log', error);
    }
  }

  async  getTables() {
    const metadatas = this.dataSource.entityMetadatas;
    return metadatas.map(metadata => ({
      name: metadata.tableName,
      columns: metadata.columns.map(col => ({
        name: col.databaseName,
        type: typeof col.type === 'function' ? col.type.name.toLowerCase() : String(col.type).toLowerCase(),
        isPrimary: col.isPrimary,
        isNullable: col.isNullable
      })),
      relations: metadata.relations.map(rel => ({
        property: rel.propertyName,
        joinColumns: rel.joinColumns.map(jc => jc.databaseName),
        targetTable: rel.inverseEntityMetadata.tableName
      }))
    }));
  }

  async getDashboardStats() {
    const metadatas = this.dataSource.entityMetadatas;
    const stats: any = {};
    for (const metadata of metadatas) {
      const count = await this.dataSource.manager.count(metadata.target);
      stats[metadata.tableName] = count;
    }
    return stats;
  }

  async getTableData(tableName: string, page: number = 1, limit: number = 20, search?: string, filters?: string) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const queryBuilder = repository.createQueryBuilder(tableName);

    if (search) {
      const stringColumns = metadata.columns.filter(c => c.type === String || c.type === 'varchar' || c.type === 'text');
      const conditions = stringColumns.map(c => `${tableName}.${c.propertyName} LIKE :search`);
      
      const primaryColumn = metadata.primaryColumns[0];
      if (!isNaN(Number(search)) && (primaryColumn.type === Number || primaryColumn.type === 'int')) {
         conditions.push(`${tableName}.${primaryColumn.propertyName} = :idSearch`);
         queryBuilder.setParameter('idSearch', Number(search));
      }

      if (conditions.length > 0) {
        queryBuilder.where(`(${conditions.join(' OR ')})`, { search: `%${search}%` });
      }
    }

    if (filters) {
      try {
        const f = JSON.parse(filters);
        for (const key of Object.keys(f)) {
          if (f[key] !== '' && f[key] !== null) {
            queryBuilder.andWhere(`${tableName}.${key} = :val_${key}`, { [`val_${key}`]: f[key] });
          }
        }
      } catch(e) {}
    }

    const dateCol = metadata.columns.find(c => ['createdAt', 'created_at', 'create_time', 'createdDate'].includes(c.propertyName));
    const primaryColumn = metadata.primaryColumns[0]?.propertyName;

    if (dateCol) {
        queryBuilder.orderBy(`${tableName}.${dateCol.propertyName}`, 'DESC');
    } else if (primaryColumn) {
        queryBuilder.orderBy(`${tableName}.${primaryColumn}`, 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async insertData(tableName: string, data: any) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const newEntity = repository.create(data);
    
    try {
      const savedEntity = await repository.save(newEntity);
      await this.logAudit('INSERT', tableName, savedEntity);
      return savedEntity;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new BadRequestException('Dữ liệu bạn nhập đã tồn tại (Lỗi trùng lặp dữ liệu Unique). Vui lòng nhập giá trị khác.');
      }
      throw new BadRequestException(`Lỗi hệ thống khi lưu: ${error.message}`);
    }
  }

  async updateData(tableName: string, id: any, data: any) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const primaryColumn = metadata.primaryColumns[0].propertyName;
    
    // Convert ID if needed (e.g. string to number)
    const entityId = metadata.primaryColumns[0].type === Number ? Number(id) : id;
    
    const existing = await repository.findOne({ where: { [primaryColumn]: entityId } as any });
    if (!existing) throw new BadRequestException(`Record with ID ${id} not found in ${tableName}`);

    try {
      await repository.update({ [primaryColumn]: entityId } as any, data);
      await this.logAudit('UPDATE', tableName, { id: entityId, changes: data });
      return { updated: true, id };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new BadRequestException('Dữ liệu bạn nhập đã tồn tại (Lỗi trùng lặp dữ liệu Unique). Vui lòng nhập giá trị khác.');
      }
      throw new BadRequestException(`Lỗi hệ thống khi cập nhật: ${error.message}`);
    }
  }

  async deleteData(tableName: string, id: any) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const primaryColumn = metadata.primaryColumns[0].propertyName;
    const entityId = metadata.primaryColumns[0].type === Number ? Number(id) : id;
    
    const result = await repository.delete({ [primaryColumn]: entityId } as any);
    if (result.affected === 0) throw new BadRequestException(`Record with ID ${id} not found in ${tableName}`);
    await this.logAudit('DELETE', tableName, { id: entityId });
    return { deleted: true, id };
  }

  async batchDelete(tableName: string, ids: any[]) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    await repository.delete(ids);
    await this.logAudit('BATCH_DELETE', tableName, { ids });
    return { deleted: true, count: ids.length };
  }

  async batchInsert(tableName: string, data: any[]) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const entities = repository.create(data);
    await repository.save(entities);
    await this.logAudit('BATCH_INSERT', tableName, { count: entities.length });
    return { inserted: true, count: entities.length };
  }
}
