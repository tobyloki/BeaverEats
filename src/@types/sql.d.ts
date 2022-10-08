interface SQLLocation {
  name: string;
  area: string;
  usesDiningDollars: 1 | 0;
}

interface SQLHours {
  start: string;
  end: string;
}

interface SQLMenuSection {
  name: string;
  locationName: string;
}

interface SQLMenuItem {
  name: string;
  description: string;
}
