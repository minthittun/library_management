import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const librarianSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

const Librarian = mongoose.model("Librarian", librarianSchema);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    publisher: { type: String, required: true },
    publishedYear: { type: Number, required: true },
  },
  { timestamps: true },
);

const Book = mongoose.model("Book", bookSchema);

const categories = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Romance",
  "Mystery",
  "Fantasy",
  "Business",
];

const publishers = [
  "Penguin Random House",
  "HarperCollins",
  "Simon & Schuster",
  "Macmillan",
  " Hachette",
  "Oxford University Press",
  "Cambridge University Press",
  "Wiley",
  "McGraw Hill",
  "Pearson",
];

const firstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
];

const bookTitles = [
  "The Great Adventure", "Journey to the Unknown", "Secrets of the Past",
  "The Last Chance", "Beyond the Horizon", "The Hidden Truth", "Echoes in Time",
  "Shadows of Tomorrow", "The Forgotten Path", "Winds of Change",
  "The Silent Observer", "Between the Lines", "The Missing Piece", "Unwritten Pages",
  "The Final Chapter", "A New Beginning", "The Eternal Flame", "Whispers in the Dark",
  "The Open Door", "Reflections of Life", "The Clock Strikes", "Dreamscape",
  "The Crystal Ball", "Walking on Air", "The Iron Gate", "Breaking Boundaries",
  "The Golden Age", "Silver Lining", "The Bronze Compass", "Rising Sun",
  "The Northern Light", "Southern Comfort", "Eastern Promise", "Western Legacy",
  "The Digital Age", "Quantum Leaps", "The Algorithm", "Data Revolution",
  "The Smart Choice", "Innovation Nation", "The Tech Frontier", "Cyber Dreams",
  "The Ancient World", "Medieval Tales", "Renaissance Revival", "Victorian Secrets",
  "The Modern Era", "Future Forward", "The Space Odyssey", "Mars Colony",
  "The AI Revolution", "Machine Learning", "The Neural Network", "Deep Thinking",
  "The Startup Story", "Business Basics", "Leadership 101", "The Entrepreneur",
  "Money Matters", "Investment Guide", "The Wealth Builder", "Financial Freedom",
  "The Health Revolution", "Mind and Body", "The Wellness Way", "Healthy Living",
  "The Cooking Class", "Recipes for Life", "The Food Journey", "Taste of Home",
  "The Travel Bug", "Wanderlust", "Around the World", "The Adventure Begins",
  "The Mystery Unfolds", "Detective Stories", "The Case File", "Cold Case",
  "The Love Story", "Hearts Entwined", "The Perfect Match", "Forever Young",
  "The Fantasy World", "Magical Realms", "The Enchanted Forest", "Dragon's Lair",
  "The Science Fair", "Experiments Galore", "The Lab Report", "Discovery",
  "The History Channel", "Ancient Civilizations", "The Time Capsule", "Legacy",
  "The Biography", "Life Stories", "The Memoir", "Portrait of a Life",
  "The Poetry Collection", "Verses and Verses", "The Sonnet Series", "Rhymes",
  "The Children's Corner", "Fun for Kids", "The Storybook", "Adventures",
  "The Art Gallery", "Masterpieces", "The Canvas", "Creative Vision",
  "The Music Room", "Symphony", "The Musical Journey", "Harmony",
  "The Sports Arena", "Game On", "The Champion's Tale", "Victory",
];

const generateISBN = () => {
  const prefix = "978";
  const group = Math.floor(Math.random() * 2);
  const publisher = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  const title = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  const checkDigit = Math.floor(Math.random() * 10);
  return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
};

const seedBooks = async () => {
  const books = [];
  const usedTitles = new Set();

  for (let i = 0; i < 100; i++) {
    let title;
    do {
      title = bookTitles[Math.floor(Math.random() * bookTitles.length)];
      if (usedTitles.has(title)) {
        title = `${title} ${i + 1}`;
      }
    } while (usedTitles.has(title));
    usedTitles.add(title);

    const book = {
      title,
      author: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
        lastNames[Math.floor(Math.random() * lastNames.length)]
      }`,
      isbn: generateISBN(),
      category: categories[Math.floor(Math.random() * categories.length)],
      publisher: publishers[Math.floor(Math.random() * publishers.length)],
      publishedYear: Math.floor(Math.random() * (2024 - 1980 + 1)) + 1980,
    };
    books.push(book);
  }

  return books;
};

const seedAll = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/library",
    );
    console.log("Connected to MongoDB");

    const adminExists = await Librarian.findOne({ username: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
    } else {
      await Librarian.create({
        username: "admin",
        password: "admin123",
        name: "Administrator",
      });
      console.log("Admin user created successfully");
      console.log("Username: admin");
      console.log("Password: admin123");
    }

    const existingBooks = await Book.countDocuments();
    if (existingBooks > 0) {
      console.log(`Database already has ${existingBooks} books. Skipping book seeding.`);
    } else {
      const books = await seedBooks();
      await Book.insertMany(books);
      console.log(`${books.length} books seeded successfully!`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedAll();
