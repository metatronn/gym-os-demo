/**
 * Physical station layout for the gym floor plan.
 * These are VISUAL LAYOUT constants — x/y positions describe
 * where bags and monitors sit on the SVG floor map.
 * Booking data comes from the database; positions live here.
 */

export type StationType = "heavy_bag" | "tv_monitor" | "custom";

export interface Station {
  id: string;
  number: number;
  label?: string;
  x: number;
  y: number;
  type: StationType;
  isBookable: boolean;
}

// Undisputed Boxing Gym -- 24 Heavy Bags + 3 TVs
export const floorStations: Station[] = [
  // TVs (decorative, non-bookable)
  {
    id: "st-tv-1",
    number: 0,
    label: "TV 1",
    x: 0.35,
    y: 0.04,
    type: "tv_monitor",
    isBookable: false,
  },
  {
    id: "st-tv-2",
    number: 0,
    label: "TV 2",
    x: 0.5,
    y: 0.04,
    type: "tv_monitor",
    isBookable: false,
  },
  {
    id: "st-tv-3",
    number: 0,
    label: "TV 3",
    x: 0.65,
    y: 0.04,
    type: "tv_monitor",
    isBookable: false,
  },
  // Row 1: Front row -- 4 bags
  {
    id: "st-01",
    number: 1,
    x: 0.3,
    y: 0.18,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-02",
    number: 2,
    x: 0.43,
    y: 0.18,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-03",
    number: 3,
    x: 0.56,
    y: 0.18,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-04",
    number: 4,
    x: 0.69,
    y: 0.18,
    type: "heavy_bag",
    isBookable: true,
  },
  // Row 2: 6 bags
  {
    id: "st-05",
    number: 5,
    x: 0.22,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-06",
    number: 6,
    x: 0.35,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-07",
    number: 7,
    x: 0.48,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-08",
    number: 8,
    x: 0.61,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-09",
    number: 9,
    x: 0.74,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-10",
    number: 10,
    x: 0.87,
    y: 0.34,
    type: "heavy_bag",
    isBookable: true,
  },
  // Row 3: 6 bags
  {
    id: "st-11",
    number: 11,
    x: 0.22,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-12",
    number: 12,
    x: 0.35,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-13",
    number: 13,
    x: 0.48,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-14",
    number: 14,
    x: 0.61,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-15",
    number: 15,
    x: 0.74,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-16",
    number: 16,
    x: 0.87,
    y: 0.5,
    type: "heavy_bag",
    isBookable: true,
  },
  // Row 4: 6 bags
  {
    id: "st-17",
    number: 17,
    x: 0.22,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-18",
    number: 18,
    x: 0.35,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-19",
    number: 19,
    x: 0.48,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-20",
    number: 20,
    x: 0.61,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-21",
    number: 21,
    x: 0.74,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-22",
    number: 22,
    x: 0.87,
    y: 0.66,
    type: "heavy_bag",
    isBookable: true,
  },
  // Offset bags -- lower left
  {
    id: "st-23",
    number: 23,
    x: 0.1,
    y: 0.78,
    type: "heavy_bag",
    isBookable: true,
  },
  {
    id: "st-24",
    number: 24,
    x: 0.22,
    y: 0.78,
    type: "heavy_bag",
    isBookable: true,
  },
];
