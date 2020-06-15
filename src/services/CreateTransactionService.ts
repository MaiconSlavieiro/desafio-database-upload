import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const balance = await transactionsRepository.getBalance();
    let parsedCategory;

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Incorrect outcome transaction');
    }

    const categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      const newCategory = await categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      parsedCategory = newCategory;
    } else {
      parsedCategory = categoryExists;
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: parsedCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
