const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const _ = require("lodash");

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://dbUser:dbPassword@cluster0-1ibtt.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
  };
  
const List = mongoose.model("List", listSchema);


const date = require(__dirname + "/date.js");

const items = ["Finish The Project"];
const workItems = [];
const defaultItems = [{"name" : "Welcome!"},{"name" : "<-- to delete an item."}]

app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function (err){
                if(err) {console.log(err)}
                else {console.log("Success!")}
            })
            res.redirect("/");
        }
        else{
        res.render("list", {listTitle : "Today", newListItems: foundItems});
        }
    })
});

app.post("/delete", function(req, res){

    let checkId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
    Item.findByIdAndDelete(checkId, function(err){
        if (err) console.log(err);
        else{
            console.log("success");
            res.redirect("/")
        }
    })
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkId}}}, function(err, foundList){
          if (!err){
            res.redirect("/" + listName);
          }
    });
    }
});

app.get("/:customListName", function(req, res){
    const customListName =  _.capitalize(req.params.customListName);
  
    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if (!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
  
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
  
  
  
  });

app.get("/work", function(req, res){
    res.render("list", {listTitle : "Work List", newListItems: workItems});

})

app.get("/about", function(req, res){
    res.render("about");

})

app.post("/work", function(req, res){
    workItems.push(req.body.newItem);
    res.redirect("/");

})

app.post("/", (req,res) => {

        const listName = req.body.list;
        const itemName = req.body.newItem;
        const item = new Item({
            name : itemName
        });
        if(listName === "Today"){
            item.save();
            res.redirect("/");
        }
        else{
            List.findOne({name:listName}, function(err,foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
        }


})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});