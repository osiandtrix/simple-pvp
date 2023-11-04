type Event = {
  text?: string;
  userId: number;
  userName: string;
  type: "attack" | "hit" | "nothit";
};

export default Event;
