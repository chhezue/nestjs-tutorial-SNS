import {
  PrimaryGeneratedColumn,
  UpdatedDateColumn,
  CreatedDateColumn,
} from 'typeorm';

// BaseModel은 직접 DB에 매핑되지 않고 다른 엔티티의 템플릿으로 작용함.
export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdatedDateColumn()
  updatedAt: Date;

  @CreatedDateColumn()
  createdAt: Date;
}
