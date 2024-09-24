import { Test, TestingModule } from '@nestjs/testing';
import { FieldTypeController } from './field-type.controller';

describe('FieldTypeController', () => {
  let controller: FieldTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldTypeController],
    }).compile();

    controller = module.get<FieldTypeController>(FieldTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
