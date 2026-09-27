import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let service: { createWallet: jest.Mock };

  beforeEach(async () => {
    service = {
      createWallet: jest.fn().mockResolvedValue({ address: 'addr-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: service }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a wallet for the authenticated user', async () => {
    const result = await controller.createWallet({ userId: 'user-1', username: 'alice' });

    expect(service.createWallet).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ address: 'addr-1' });
  });
});
