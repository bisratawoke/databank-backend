import { Test, TestingModule } from '@nestjs/testing';
import { FieldTypeService } from './field-type.service';

describe('FieldTypeService', () => {
  let service: FieldTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypeService],
    }).compile();

    service = module.get<FieldTypeService>(FieldTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
