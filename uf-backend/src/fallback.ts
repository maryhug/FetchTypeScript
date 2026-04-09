// ============================================================
// DATOS DE RESPALDO (FALLBACK)
// Se usan cuando la API externa no responde o falla.
// Así la app nunca se "rompe" de cara al usuario.
// ============================================================

import type { AnimeQuote, RandomUser, Fruit } from "./types";

// --- Citas de anime ---
export const animeQuotesFallback: AnimeQuote[] = [
  { anime: "Fullmetal Alchemist: Brotherhood", character: "Edward Elric",    quote: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something." },
  { anime: "Naruto",                           character: "Itachi Uchiha",    quote: "Those who forgive themselves, and are able to accept their true nature... They are the strong ones." },
  { anime: "Attack on Titan",                  character: "Armin Arlert",     quote: "Someone who can't sacrifice anything, can't change anything." },
  { anime: "One Piece",                        character: "Monkey D. Luffy",  quote: "I don't want to conquer anything. I just think the person with the most freedom in this whole ocean is the King of the Pirates!" },
  { anime: "Death Note",                       character: "L Lawliet",        quote: "If you use your head, you won't get fat even if you eat sweets." },
  { anime: "Steins;Gate",                      character: "Rintaro Okabe",    quote: "The universe has a beginning, but no end. Stars are born and die. Galaxies come and go. But the universe remains." },
];

export function getRandomAnimeQuote(): AnimeQuote {
  return animeQuotesFallback[Math.floor(Math.random() * animeQuotesFallback.length)];
}

// --- Usuarios de respaldo ---
export const usersFallback: RandomUser[] = [
  { name: { title: "Ms", first: "Valentina", last: "Torres"  }, email: "v.torres@example.com",  location: { country: "Colombia",   city: "Medellín"      }, picture: { large: "https://randomuser.me/api/portraits/women/1.jpg", medium: "https://randomuser.me/api/portraits/med/women/1.jpg", thumbnail: "https://randomuser.me/api/portraits/thumb/women/1.jpg" }, phone: "300-123-4567", nat: "CO" },
  { name: { title: "Mr", first: "Sebastián", last: "Molina"  }, email: "s.molina@example.com",  location: { country: "México",     city: "Ciudad de México" }, picture: { large: "https://randomuser.me/api/portraits/men/2.jpg",   medium: "https://randomuser.me/api/portraits/med/men/2.jpg",   thumbnail: "https://randomuser.me/api/portraits/thumb/men/2.jpg"   }, phone: "55-987-6543",  nat: "MX" },
  { name: { title: "Ms", first: "Camila",    last: "Ríos"    }, email: "c.rios@example.com",    location: { country: "Argentina",  city: "Buenos Aires"  }, picture: { large: "https://randomuser.me/api/portraits/women/3.jpg", medium: "https://randomuser.me/api/portraits/med/women/3.jpg", thumbnail: "https://randomuser.me/api/portraits/thumb/women/3.jpg" }, phone: "11-222-3333",  nat: "AR" },
  { name: { title: "Mr", first: "Andrés",    last: "Peña"    }, email: "a.pena@example.com",    location: { country: "Chile",      city: "Santiago"      }, picture: { large: "https://randomuser.me/api/portraits/men/4.jpg",   medium: "https://randomuser.me/api/portraits/med/men/4.jpg",   thumbnail: "https://randomuser.me/api/portraits/thumb/men/4.jpg"   }, phone: "2-333-4444",   nat: "CL" },
  { name: { title: "Ms", first: "Laura",     last: "García"  }, email: "l.garcia@example.com",  location: { country: "España",     city: "Madrid"        }, picture: { large: "https://randomuser.me/api/portraits/women/5.jpg", medium: "https://randomuser.me/api/portraits/med/women/5.jpg", thumbnail: "https://randomuser.me/api/portraits/thumb/women/5.jpg" }, phone: "91-555-6677",  nat: "ES" },
  { name: { title: "Mr", first: "Carlos",    last: "López"   }, email: "c.lopez@example.com",   location: { country: "Colombia",   city: "Bogotá"        }, picture: { large: "https://randomuser.me/api/portraits/men/6.jpg",   medium: "https://randomuser.me/api/portraits/med/men/6.jpg",   thumbnail: "https://randomuser.me/api/portraits/thumb/men/6.jpg"   }, phone: "310-888-9999", nat: "CO" },
];

// --- Frutas de respaldo ---
export const fruitsFallback: Fruit[] = [
  { id: 1,  name: "Apple",      family: "Rosaceae",      order: "Rosales",      genus: "Malus",      nutritions: { calories: 52,  fat: 0.4,  sugar: 10.3, carbohydrates: 11.4, protein: 0.3 } },
  { id: 2,  name: "Banana",     family: "Musaceae",      order: "Zingiberales", genus: "Musa",       nutritions: { calories: 96,  fat: 0.2,  sugar: 17.2, carbohydrates: 22.0, protein: 1.0 } },
  { id: 3,  name: "Mango",      family: "Anacardiaceae", order: "Sapindales",   genus: "Mangifera",  nutritions: { calories: 60,  fat: 0.4,  sugar: 13.7, carbohydrates: 15.0, protein: 0.8 } },
  { id: 4,  name: "Strawberry", family: "Rosaceae",      order: "Rosales",      genus: "Fragaria",   nutritions: { calories: 29,  fat: 0.4,  sugar: 5.4,  carbohydrates: 5.5,  protein: 0.8 } },
  { id: 5,  name: "Pineapple",  family: "Bromeliaceae",  order: "Poales",       genus: "Ananas",     nutritions: { calories: 50,  fat: 0.1,  sugar: 9.9,  carbohydrates: 13.1, protein: 0.5 } },
  { id: 6,  name: "Watermelon", family: "Cucurbitaceae", order: "Cucurbitales", genus: "Citrullus",  nutritions: { calories: 30,  fat: 0.2,  sugar: 6.2,  carbohydrates: 8.0,  protein: 0.6 } },
  { id: 7,  name: "Grape",      family: "Vitaceae",      order: "Vitales",      genus: "Vitis",      nutritions: { calories: 69,  fat: 0.2,  sugar: 16.0, carbohydrates: 18.0, protein: 0.7 } },
  { id: 8,  name: "Lemon",      family: "Rutaceae",      order: "Sapindales",   genus: "Citrus",     nutritions: { calories: 29,  fat: 0.3,  sugar: 2.5,  carbohydrates: 9.0,  protein: 1.1 } },
  { id: 9,  name: "Orange",     family: "Rutaceae",      order: "Sapindales",   genus: "Citrus",     nutritions: { calories: 43,  fat: 0.2,  sugar: 8.5,  carbohydrates: 8.3,  protein: 1.0 } },
  { id: 10, name: "Blueberry",  family: "Ericaceae",     order: "Ericales",     genus: "Vaccinium",  nutritions: { calories: 57,  fat: 0.4,  sugar: 10.0, carbohydrates: 14.5, protein: 0.7 } },
  { id: 11, name: "Avocado",    family: "Lauraceae",     order: "Laurales",     genus: "Persea",     nutritions: { calories: 160, fat: 14.7, sugar: 0.7,  carbohydrates: 8.5,  protein: 2.0 } },
  { id: 12, name: "Peach",      family: "Rosaceae",      order: "Rosales",      genus: "Prunus",     nutritions: { calories: 39,  fat: 0.3,  sugar: 8.4,  carbohydrates: 10.0, protein: 0.9 } },
];
