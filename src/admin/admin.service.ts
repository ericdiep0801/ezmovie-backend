import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(private dataSource: DataSource) {}

  async getTables() {
    const metadatas = this.dataSource.entityMetadatas;
    return metadatas.map(metadata => ({
      name: metadata.tableName,
      columns: metadata.columns.map(col => ({
        name: col.databaseName,
        type: col.type,
        isPrimary: col.isPrimary,
        isNullable: col.isNullable
      }))
    }));
  }

  async getTableData(tableName: string, page: number = 1, limit: number = 20, search?: string) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const alias = 'entity';
    const queryBuilder = repository.createQueryBuilder(alias);

    if (search) {
      const stringColumns = metadata.columns.filter(col => 
        col.type === String || 
        (typeof col.type === 'string' && ['varchar', 'text', 'char'].includes(col.type.toLowerCase()))
      );
      
      if (stringColumns.length > 0) {
        const whereClause = stringColumns.map(col => `${alias}.${col.propertyName} LIKE :search`).join(' OR ');
        queryBuilder.where(`(${whereClause})`, { search: `%${search}%` });
      } else if (!isNaN(Number(search)) && metadata.primaryColumns[0]) {
        queryBuilder.where(`${alias}.${metadata.primaryColumns[0].propertyName} = :search`, { search: Number(search) });
      }
    }

    const dateCol = metadata.columns.find(c => ['createdAt', 'created_at', 'create_time', 'createdDate'].includes(c.propertyName));
    const primaryColumn = metadata.primaryColumns[0]?.propertyName;

    if (dateCol) {
        queryBuilder.orderBy(`${alias}.${dateCol.propertyName}`, 'DESC');
    } else if (primaryColumn) {
        queryBuilder.orderBy(`${alias}.${primaryColumn}`, 'DESC');
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
    return await repository.save(newEntity);
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

    // Merge updates
    for (const key of Object.keys(data)) {
        if (key !== primaryColumn) { // don't update primary key
            existing[key] = data[key];
        }
    }
    return await repository.save(existing);
  }

  async deleteData(tableName: string, id: any) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    const repository = this.dataSource.getRepository(metadata.target);
    const primaryColumn = metadata.primaryColumns[0].propertyName;
    const entityId = metadata.primaryColumns[0].type === Number ? Number(id) : id;
    
    const result = await repository.delete({ [primaryColumn]: entityId } as any);
    if (result.affected === 0) throw new BadRequestException(`Record with ID ${id} not found in ${tableName}`);
    return { deleted: true, id };
  }
}
