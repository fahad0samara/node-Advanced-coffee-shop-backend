// In-memory storage (replace with a database in production)
const coffees = [
  {
    id: 1,
    name: 'Espresso',
    price: 3.50,
    description: 'Strong and concentrated coffee shot'
  },
  {
    id: 2,
    name: 'Cappuccino',
    price: 4.50,
    description: 'Espresso with steamed milk and foam'
  }
];

export const getAllCoffees = (req, res) => {
  res.json(coffees);
};

export const getCoffeeById = (req, res) => {
  const coffee = coffees.find(c => c.id === parseInt(req.params.id));
  if (!coffee) return res.status(404).json({ message: 'Coffee not found' });
  res.json(coffee);
};

export const createCoffee = (req, res) => {
  const { name, price, description } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  const newCoffee = {
    id: coffees.length + 1,
    name,
    price,
    description
  };

  coffees.push(newCoffee);
  res.status(201).json(newCoffee);
};