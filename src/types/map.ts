export interface AlternativeLocation {
  areaCode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  priority: number;
  congestionLevel: string;
}

export interface CultureEvent {
  title: string;
  place: string;
  codename: string;
  startDate: string;
  endDate: string;
  useFee: string | null;
  orgLink: string;
  mainImg: string;
  latitude: number;
  longitude: number;
}
