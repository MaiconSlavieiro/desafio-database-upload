import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );

    const transaction = await transactionsRepository.findOne({
      where: {
        id,
      },
    });

    if (!transaction) {
      throw new AppError('Invalid ID');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
