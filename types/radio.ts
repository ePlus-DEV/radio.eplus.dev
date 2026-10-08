export interface RadioSource {
  src: string;
  type?: string;
  source?: string;
  label?: string;
  proxied?: boolean;
}

export interface RadioStationOption {
  id: string;
  title: string;
  image: string;
  url?: string;
}
