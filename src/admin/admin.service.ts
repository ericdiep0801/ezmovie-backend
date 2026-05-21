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

  async getTableData(tableName: string) {
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (!metadata) throw new BadRequestException(`Table ${tableName} not found`);

    return await this.dataSource.manager.find(metadata.target);
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
