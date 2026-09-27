import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WalletService } from './wallet.service';
import { DatabaseService } from '../database/database.service';
import { encryptPrivateKey, decryptPrivateKey } from '../common/wallet-crypto.util';

describe('WalletService', () => {
  let service: WalletService;
  let db: { query: jest.Mock; withTransaction: jest.Mock };

  beforeEach(async () => {
    db = {
      query: jest.fn(),
      withTransaction: jest.fn().mockImplementation((fn) =>
        fn({ query: jest.fn().mockResolvedValue({ rows: [] }) }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: DatabaseService, useValue: db },
        {
          provide: ConfigService,
          useValue: { get: () => 'test-encryption-passphrase' },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a wallet and persists it for the owning user', async () => {
    const { address } = await service.createWallet('user-1');

    expect(address).toEqual(expect.any(String));
    expect(db.withTransaction).toHaveBeenCalledTimes(1);
  });

  it('round-trips an encrypted private key', () => {
    const encrypted = encryptPrivateKey('super-secret-key', 'passphrase');
    expect(decryptPrivateKey(encrypted, 'passphrase')).toBe('super-secret-key');
  });
});
