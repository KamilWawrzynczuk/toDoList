import { Schema, model } from "mongoose";

export const defaultItems = [
  {
    name: "Welcome to your todoList!",
  },
  {
    name: "Hit the + button to add a new item",
  },
  {
    name: "<-- Hit this to delete an item.",
  },
];

const itemsSchema = new Schema({
  name: String,
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};

export const Item = new model("Item", itemsSchema);
export const List = model("List", listSchema);
