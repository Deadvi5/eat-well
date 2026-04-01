import type {
  User,
  Dish,
  DailyMenu,
  PickupPoint,
  TimeSlot,
  Order,
} from '../types'

// ── Users ──────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u1',
    name: 'Marco Rossi',
    role: 'employee',
    email: 'marco.rossi@ospedale.it',
    badge: 'EMP-4421',
    walletBalance: 45.5,
    dietaryPreferences: [],
    allergies: [],
  },
  {
    id: 'u2',
    name: 'Anna Bianchi',
    role: 'patient',
    email: 'anna.bianchi@email.it',
    roomNumber: '307-B',
    dietaryPreferences: ['gluten_free'],
    allergies: ['gluten'],
  },
  {
    id: 'u3',
    name: 'Giulia Ferrari',
    role: 'admin',
    email: 'giulia.ferrari@ospedale.it',
    dietaryPreferences: [],
    allergies: [],
  },
]

// ── Dishes ─────────────────────────────────────────────

export const dishes: Dish[] = [
  // Colazione
  {
    id: 'd1',
    name: 'Cornetto alla marmellata',
    description: 'Cornetto classico farcito con marmellata di albicocche',
    price: 1.2,
    course: 'primo',
    mealTime: ['colazione'],
    calories: 220,
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    available: true,
    imageEmoji: '🥐',
  },
  {
    id: 'd2',
    name: 'Yogurt con granola',
    description: 'Yogurt bianco con granola croccante e miele',
    price: 2.5,
    course: 'contorno',
    mealTime: ['colazione'],
    calories: 180,
    allergens: ['dairy', 'nuts'],
    dietaryTags: ['vegetarian'],
    available: true,
    imageEmoji: '🥣',
  },
  {
    id: 'd3',
    name: 'Cappuccino',
    description: 'Cappuccino cremoso con latte intero',
    price: 1.1,
    course: 'bevanda',
    mealTime: ['colazione'],
    calories: 90,
    allergens: ['dairy'],
    dietaryTags: ['vegetarian'],
    available: true,
    imageEmoji: '☕',
  },
  {
    id: 'd4',
    name: 'Pane e burro senza glutine',
    description: 'Pane senza glutine con burro fresco',
    price: 1.8,
    course: 'primo',
    mealTime: ['colazione'],
    calories: 150,
    allergens: ['dairy'],
    dietaryTags: ['gluten_free', 'vegetarian'],
    available: true,
    imageEmoji: '🍞',
  },

  // Spuntino
  {
    id: 'd5',
    name: 'Frutta di stagione',
    description: 'Selezione di frutta fresca di stagione',
    price: 1.5,
    course: 'contorno',
    mealTime: ['spuntino'],
    calories: 80,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🍎',
  },
  {
    id: 'd6',
    name: 'Crackers e formaggio',
    description: 'Crackers integrali con formaggio spalmabile',
    price: 2.0,
    course: 'primo',
    mealTime: ['spuntino'],
    calories: 160,
    allergens: ['gluten', 'dairy'],
    dietaryTags: ['vegetarian'],
    available: true,
    imageEmoji: '🧀',
  },
  {
    id: 'd7',
    name: 'Succo di frutta',
    description: 'Succo di frutta 100% naturale',
    price: 1.2,
    course: 'bevanda',
    mealTime: ['spuntino', 'pranzo'],
    calories: 60,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🧃',
  },

  // Pranzo — Primi
  {
    id: 'd8',
    name: 'Risotto al pomodoro',
    description: 'Risotto cremoso con salsa di pomodoro fresco e basilico',
    price: 3.5,
    course: 'primo',
    mealTime: ['pranzo', 'cena'],
    calories: 320,
    allergens: [],
    dietaryTags: ['vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '🍚',
  },
  {
    id: 'd9',
    name: 'Pasta al ragù',
    description: 'Penne con ragù di carne alla bolognese',
    price: 3.5,
    course: 'primo',
    mealTime: ['pranzo'],
    calories: 420,
    allergens: ['gluten', 'eggs'],
    dietaryTags: [],
    available: true,
    imageEmoji: '🍝',
  },
  {
    id: 'd10',
    name: 'Pasta senza glutine al pesto',
    description: 'Fusilli senza glutine con pesto genovese fresco',
    price: 4.0,
    course: 'primo',
    mealTime: ['pranzo'],
    calories: 380,
    allergens: ['nuts', 'dairy'],
    dietaryTags: ['gluten_free', 'vegetarian'],
    available: true,
    imageEmoji: '🌿',
  },

  // Pranzo — Secondi
  {
    id: 'd11',
    name: 'Pollo arrosto',
    description: 'Petto di pollo arrosto con erbe aromatiche',
    price: 4.5,
    course: 'secondo',
    mealTime: ['pranzo', 'cena'],
    calories: 280,
    allergens: [],
    dietaryTags: ['gluten_free'],
    available: true,
    imageEmoji: '🍗',
  },
  {
    id: 'd12',
    name: 'Filetto di merluzzo',
    description: 'Merluzzo al forno con limone e prezzemolo',
    price: 5.0,
    course: 'secondo',
    mealTime: ['pranzo', 'cena'],
    calories: 220,
    allergens: [],
    dietaryTags: ['gluten_free'],
    available: true,
    imageEmoji: '🐟',
  },
  {
    id: 'd13',
    name: 'Cotoletta di tofu',
    description: 'Tofu croccante impanato con pangrattato senza glutine',
    price: 4.0,
    course: 'secondo',
    mealTime: ['pranzo'],
    calories: 250,
    allergens: ['soy'],
    dietaryTags: ['vegan', 'vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '🌱',
  },

  // Pranzo — Contorni
  {
    id: 'd14',
    name: 'Patate al forno',
    description: 'Patate dorate al forno con rosmarino',
    price: 1.5,
    course: 'contorno',
    mealTime: ['pranzo'],
    calories: 150,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🥔',
  },
  {
    id: 'd15',
    name: 'Insalata mista',
    description: 'Insalata verde con pomodorini, carote e mais',
    price: 1.5,
    course: 'contorno',
    mealTime: ['pranzo', 'cena'],
    calories: 60,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🥗',
  },
  {
    id: 'd16',
    name: 'Verdure grigliate',
    description: 'Zucchine, melanzane e peperoni alla griglia',
    price: 1.8,
    course: 'contorno',
    mealTime: ['pranzo'],
    calories: 90,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🥦',
  },

  // Pranzo — Dessert
  {
    id: 'd17',
    name: 'Tiramisù',
    description: 'Tiramisù classico con mascarpone e caffè',
    price: 2.5,
    course: 'dessert',
    mealTime: ['pranzo'],
    calories: 310,
    allergens: ['dairy', 'eggs', 'gluten'],
    dietaryTags: [],
    available: true,
    imageEmoji: '🍮',
  },
  {
    id: 'd18',
    name: 'Panna cotta senza lattosio',
    description: 'Panna cotta delicata con latte senza lattosio e vaniglia',
    price: 2.5,
    course: 'dessert',
    mealTime: ['pranzo'],
    calories: 200,
    allergens: [],
    dietaryTags: ['lactose_free', 'gluten_free'],
    available: true,
    imageEmoji: '🍮',
  },
  {
    id: 'd19',
    name: 'Frutta fresca',
    description: 'Piatto di frutta fresca di stagione',
    price: 1.5,
    course: 'dessert',
    mealTime: ['pranzo'],
    calories: 70,
    allergens: [],
    dietaryTags: ['vegan', 'vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '🍊',
  },

  // Bevande (pranzo)
  {
    id: 'd20',
    name: 'Acqua naturale 0.5L',
    description: 'Acqua minerale naturale',
    price: 0.5,
    course: 'bevanda',
    mealTime: ['pranzo', 'cena'],
    calories: 0,
    allergens: [],
    dietaryTags: ['vegan', 'vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '💧',
  },
  {
    id: 'd21',
    name: 'Acqua frizzante 0.5L',
    description: 'Acqua minerale frizzante',
    price: 0.5,
    course: 'bevanda',
    mealTime: ['pranzo', 'cena'],
    calories: 0,
    allergens: [],
    dietaryTags: ['vegan', 'vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '💧',
  },

  // Cena
  {
    id: 'd22',
    name: 'Minestrone di verdure',
    description: 'Zuppa calda con verdure miste di stagione',
    price: 3.0,
    course: 'primo',
    mealTime: ['cena'],
    calories: 180,
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    available: true,
    imageEmoji: '🥣',
  },
  {
    id: 'd23',
    name: 'Pasta al pomodoro',
    description: 'Spaghetti con salsa di pomodoro fresco e basilico',
    price: 3.0,
    course: 'primo',
    mealTime: ['cena'],
    calories: 350,
    allergens: ['gluten'],
    dietaryTags: ['vegetarian', 'vegan'],
    available: true,
    imageEmoji: '🍝',
  },
  {
    id: 'd24',
    name: 'Frittata di verdure',
    description: 'Frittata leggera con zucchine e carote',
    price: 3.5,
    course: 'secondo',
    mealTime: ['cena'],
    calories: 220,
    allergens: ['eggs'],
    dietaryTags: ['vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '🍳',
  },
  {
    id: 'd25',
    name: 'Yogurt e frutta',
    description: 'Yogurt bianco con frutta fresca di stagione',
    price: 2.0,
    course: 'dessert',
    mealTime: ['cena'],
    calories: 120,
    allergens: ['dairy'],
    dietaryTags: ['vegetarian', 'gluten_free'],
    available: true,
    imageEmoji: '🍨',
  },
]

// ── Daily Menus (today + 6 days) ──────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function generateDailyMenus(): DailyMenu[] {
  const today = new Date()
  const menus: DailyMenu[] = []

  // Deterministic "random" unavailability per day
  const unavailableByDay: number[][] = [
    [2, 9, 17],
    [4, 11, 20],
    [1, 13, 18],
    [6, 8, 15],
    [3, 12, 19],
    [5, 10, 16],
    [7, 14, 21],
  ]

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const unavailableIndices = unavailableByDay[i]

    const dayDishes = dishes.map((dish, idx) => ({
      ...dish,
      available: !unavailableIndices.includes(idx + 1),
    }))

    menus.push({
      date: formatDate(date),
      dishes: dayDishes,
    })
  }

  return menus
}

export const dailyMenus: DailyMenu[] = generateDailyMenus()

// ── Pickup Points ──────────────────────────────────────

export const pickupPoints: PickupPoint[] = [
  { id: 'p1', name: 'Mensa Principale', location: 'Piano 0 – Ala Nord', emoji: '🏪' },
  { id: 'p2', name: 'Distribuzione Reparto', location: 'Piano 2 – Corridoio B', emoji: '🏥' },
  { id: 'p3', name: 'Ritiro Veloce', location: 'Ingresso Principale', emoji: '⚡' },
]

// ── Time Slots ─────────────────────────────────────────

export const timeSlots: TimeSlot[] = [
  { id: 't1', time: '12:00', availableSeats: 8 },
  { id: 't2', time: '12:30', availableSeats: 12 },
  { id: 't3', time: '13:00', availableSeats: 5 },
  { id: 't4', time: '13:30', availableSeats: 15 },
]

// ── Historic Orders (for user u1) ─────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return formatDate(d)
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const today = formatDate(new Date())

export const orders: Order[] = [
  {
    id: 'ord-001',
    userId: 'u1',
    date: daysAgo(3),
    mealTime: 'pranzo',
    items: [
      { dish: dishes[7], quantity: 1 },  // Risotto al pomodoro
      { dish: dishes[10], quantity: 1 }, // Pollo arrosto
      { dish: dishes[14], quantity: 1 }, // Insalata mista
      { dish: dishes[19], quantity: 1 }, // Acqua naturale
    ],
    totalPrice: 10.0,
    status: 'collected',
    pickupPointId: 'p1',
    timeSlotId: 't2',
    paymentMethod: 'wallet',
    qrCode: 'ORD-001-QR',
    createdAt: daysAgoISO(3),
  },
  {
    id: 'ord-002',
    userId: 'u1',
    date: daysAgo(1),
    mealTime: 'pranzo',
    items: [
      { dish: dishes[8], quantity: 1 },  // Pasta al ragù
      { dish: dishes[11], quantity: 1 }, // Filetto di merluzzo
      { dish: dishes[15], quantity: 1 }, // Verdure grigliate
      { dish: dishes[16], quantity: 1 }, // Tiramisù
    ],
    totalPrice: 12.8,
    status: 'collected',
    pickupPointId: 'p1',
    timeSlotId: 't1',
    paymentMethod: 'wallet',
    qrCode: 'ORD-002-QR',
    createdAt: daysAgoISO(1),
  },
  {
    id: 'ord-003',
    userId: 'u1',
    date: today,
    mealTime: 'pranzo',
    items: [
      { dish: dishes[9], quantity: 1 },  // Pasta senza glutine al pesto
      { dish: dishes[13], quantity: 1 }, // Patate al forno
      { dish: dishes[20], quantity: 1 }, // Acqua frizzante
    ],
    totalPrice: 6.0,
    status: 'confirmed',
    pickupPointId: 'p2',
    timeSlotId: 't2',
    paymentMethod: 'card',
    qrCode: 'ORD-003-QR',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-004',
    userId: 'u1',
    date: today,
    mealTime: 'pranzo',
    items: [
      { dish: dishes[7], quantity: 1 },  // Risotto al pomodoro
      { dish: dishes[12], quantity: 1 }, // Cotoletta di tofu
      { dish: dishes[18], quantity: 1 }, // Frutta fresca
    ],
    totalPrice: 9.0,
    status: 'ready',
    pickupPointId: 'p3',
    timeSlotId: 't3',
    paymentMethod: 'payroll',
    qrCode: 'ORD-004-QR',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-005',
    userId: 'u1',
    date: today,
    mealTime: 'pranzo',
    items: [
      { dish: dishes[8], quantity: 1 },  // Pasta al ragù
      { dish: dishes[10], quantity: 1 }, // Pollo arrosto
      { dish: dishes[14], quantity: 1 }, // Insalata mista
      { dish: dishes[17], quantity: 1 }, // Panna cotta senza lattosio
      { dish: dishes[19], quantity: 1 }, // Acqua naturale
    ],
    totalPrice: 12.0,
    status: 'pending',
    pickupPointId: 'p1',
    timeSlotId: 't4',
    paymentMethod: 'wallet',
    qrCode: 'ORD-005-QR',
    createdAt: new Date().toISOString(),
  },
]
