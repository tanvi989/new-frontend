
import { Frame } from '../types';
import { API_BASE_URL } from './axiosConfig';

const MOCK_DATABASE_FRAMES: Frame[] = [
  {
    id: 1,
    name: "Red Cat Eye",
    price: "£149",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800", 
    colors: ["#8B0000", "#000000", "#A52A2A"]
  },
  {
    id: 2,
    name: "Blue Rectangular",
    price: "£149",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    colors: ["#000080", "#000000", "#FF0000"]
  },
  {
    id: 3,
    name: "Black Thick Rim",
    price: "£149",
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800",
    colors: ["#000000", "#4B3621", "#808080"]
  },
  {
    id: 4,
    name: "Rimless Titanium",
    price: "£139",
    image: "https://plus.unsplash.com/premium_photo-1675807963740-3f7b32791715?auto=format&fit=crop&q=80&w=800",
    colors: ["#C0C0C0", "#000000", "#B87333"]
  }
];

export const getFrames = async (): Promise<Frame[]> => {
  // In a real scenario:
  // const response = await fetch(`${API_BASE_URL}/frames`);
  // return response.json();

  // Simulating network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATABASE_FRAMES);
    }, 800);
  });
};
