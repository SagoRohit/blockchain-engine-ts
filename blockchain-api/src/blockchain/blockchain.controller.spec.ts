import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

describe('BlockchainController', () => {
  let controller: BlockchainController;
  let service: { getBlocks: jest.Mock };

  beforeEach(async () => {
    service = {
      getBlocks: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [{ provide: BlockchainService, useValue: service }],
    }).compile();

    controller = module.get<BlockchainController>(BlockchainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates getBlockchain to the service', async () => {
    await controller.getBlockchain();
    expect(service.getBlocks).toHaveBeenCalledTimes(1);
  });
});
