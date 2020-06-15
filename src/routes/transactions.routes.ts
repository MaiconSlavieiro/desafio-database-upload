import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const parsedType = type.toLowerCase();

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type: parsedType,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);
  response.status(200).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const filePath = path.resolve(
      uploadConfig.directory,
      request.file.filename,
    );

    const importTransactions = new ImportTransactionsService();
    const transactionsCreate = await importTransactions.execute(filePath);

    return response.json(transactionsCreate);
  },
);

export default transactionsRouter;
