export interface Track {
  id: string;
  name: string;
  artistId: string | null;
  albumId: string | null;
  duration: number;
}

export enum TypeOperation {
  create = 1,
  update = 2,
}
