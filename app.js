const express = require("express");
const app = express();
const elbClient = require("./src/config/ELBConfig");
app.use(express.json({}));

const PLAYER_INDEX = "player-index";

const bulkOperations = [
  { index: { _index: PLAYER_INDEX, _id: 1 } },
  { name: "ronaldo", age: 35, club: "MU" },

  { index: { _index: PLAYER_INDEX, _id: 2 } },
  { name: "ronaldo", age: 30, club: "Real Madrid" },

  { index: { _index: PLAYER_INDEX, _id: 3 } },
  { name: "ronaldo", age: 36, club: "Juventus" },
];

app.get("/api/v1/players", async (req, res) => {
  const { name } = req.query;
  try {
    const data = await elbClient.search({
      index: PLAYER_INDEX,
      body: {
        query: {
          multi_match: {
            query: name,
            fields: ["name", "club"],
            fuzziness: 3,
          },
        },
      },
    });
    const searchResults = data.hits.hits;
    let returnList = [];
    for (let item of searchResults) {
      returnList.push(item._source);
    }
    return res.json({ message: "Success", data: returnList });
  } catch (err) {
    return res.json(JSON.parse(err.response));
  }
});

app.get("/api/v1/players/bulk", (req, res) => {
  elbClient.bulk({ body: bulkOperations }, (err, res) => {
    if (err) {
      console.error("Failed to perform bulk operation:", err);
    } else {
      console.log("Bulk operation completed successfully:", res);
    }
  });
  return res.send("okay");
});

app.post("/api/v1/players", async (req, res) => {
  const { name, age, club } = req.body;
  try {
    await elbClient.index({
      index: PLAYER_INDEX,
      body: {
        name,
        age,
        club,
      },
    });
    return res.send("Success");
  } catch (err) {
    return res.send(err);
  }
});

app.put("/api/v1/players/:id", async (req, res) => {
  const id = req.params.id;
  const { name, age, club } = req.body;
  try {
    await elbClient.update({
      index: PLAYER_INDEX,
      id,
      body: {
        doc: {
          name,
          age,
          club,
        },
      },
    });
    return res.send("Success");
  } catch (err) {
    return res.send(err);
  }
});

app.delete("/api/v1/players/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await elbClient.delete({
      index: PLAYER_INDEX,
      id,
    });
    return res.send("Success");
  } catch (err) {
    return res.send(err);
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
