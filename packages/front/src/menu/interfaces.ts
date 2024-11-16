export interface Item {
  text: string;
  items?: Item[];
  selection?: boolean;
}
