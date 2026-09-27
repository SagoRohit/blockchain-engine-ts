import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { DatabaseService } from '../database/database.service';
import { WalletService } from '../wallet/wallet.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let db: { query: jest.Mock; withTransaction: jest.Mock };
  let walletService: { getWallet: jest.Mock; getBalance: jest.Mock; decryptPrivateKeyFor: jest.Mock };

  beforeEach(async () => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [{ count: '1' }] }),
      withTransaction: jest.fn().mockImplementation((fn) =>
        fn({ query: jest.fn().mockResolvedValue({ rows: [] }) }),
      ),
    };
    walletService = {
      getWallet: jest.fn(),
      getBalance: jest.fn(),
      decryptPrivateKeyFor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        { provide: DatabaseService, useValue: db },
        { provide: WalletService, useValue: walletService },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects mining to an unknown wallet address', async () => {
    walletService.getWallet.mockResolvedValue(null);

    await expect(
      service.mine({ minerAddress: 'unknown-address' }),
    ).rejects.toThrow('Miner address not found!');
  });

  it('rejects creating a transaction the caller does not own', async () => {
    walletService.getWallet.mockResolvedValue({
      id: 'wallet-1',
      user_id: 'owner-user-id',
      address: 'addr-a',
      encrypted_private_key: 'enc',
      created_at: new Date(),
    });

    await expect(
      service.createTransaction(
        { from: 'addr-a', to: 'addr-b', amount: 10 },
        { userId: 'someone-else', username: 'bob' },
      ),
    ).rejects.toThrow('You do not own this wallet');
  });
});
