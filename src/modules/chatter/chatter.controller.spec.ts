import { Test, TestingModule } from '@nestjs/testing';
import { ChatterController } from './chatter.controller';

describe('ChatterController', () => {
  let controller: ChatterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatterController],
    }).compile();

    controller = module.get<ChatterController>(ChatterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
