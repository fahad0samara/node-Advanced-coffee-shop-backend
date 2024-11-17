import express from 'express';
import { getAllCoffees, getCoffeeById, createCoffee } from '../controllers/coffee.js';

export const router = express.Router();

router.get('/', getAllCoffees);
router.get('/:id', getCoffeeById);
router.post('/', createCoffee);