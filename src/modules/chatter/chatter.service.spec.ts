import { Test, TestingModule } from '@nestjs/testing';
import { ChatterService } from './chatter.service';

describe('ChatterService', () => {
  let service: ChatterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatterService],
    }).compile();

    service = module.get<ChatterService>(ChatterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
