import express from "express";
import { set, connect } from "mongoose";
import capitalize from "lodash";
import { config } from "dotenv";
import { List, Item, defaultItems} from "./models/item.model.js";


// initialize our server
const app = express();

// using embedded javascript
app.set("view engine", "ejs");
app.use(express.static("public"));

// using to be able read data from Form from
// client side
app.use(express.urlencoded({ extended: true }));

// using for reading information's from .env
config();

// using for connect our app to MongoDB Atlas
set("strictQuery", false);
connect(process.env.URI, {
  useNewUrlParser: true,
});

// setting our routes

app.get("/", function (req, res) {
  // checking if our todoList is empty and if yes
  // fill with default data
  const items = Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items added to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.get("/:customListName", function (req, res) {
  // ensuring that small or capital letters are
  // not important
  const customListName = capitalize(req.params.customListName);

  // checking if List already existing or not.
  // Depends on that sending proper respond
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemDocument = new Item({
    name: itemName,
  });

  // checking on which list we are working right
  // now to where save our data
  if (listName === "Today") {
    itemDocument.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(itemDocument);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // checking on which list we are working right
  // now to from where delete our data
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted.");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

const port = process.env.PORT || 3001;

app.listen(port, function () {
  console.log("Server successfully started.");
});
