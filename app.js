const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

const app = express();
app.use(express.json());

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1
app.post("/login/", async (request, response) => {
  //scenario 1
  const { username, password } = require.body;
  const selectUserQuery = `
              SELECT 
              * 
              FROM 
              state 
              WHERE username = '${username}';
              `;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "poornima");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//API 2
app.get("/states/", async (request, response) => {
  const getBooksQuery = `
    SELECT * 
    FROM state 
    ORDER BY state_id;`;

  const stateArray = await db.all(getBooksQuery);
  response.send(stateArray);
});

//API 3
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * 
    FROM state 
    Where state_id = ${stateId};`;

  const state = await db.get(getStateQuery);
  response.send(state);
});

//API 4
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrictQuery = `
    INSERT INTO 
    district (district_id, district_name, state_id, cases, cured, active, deaths)
    VALUES (
        '${districtName}',
        '${stateId}',
        '${cases};,
        '${cured}',
        '${active}',
        '${deaths}'
        );`;
  const dbResponse = await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

// API 5
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * 
    FROM district 
    WHERE district_id = ${districtId};`;

  let district = await db.get(getDistrictQuery);
  response.send(district);
});
//API 6
app.delete("/districts/:districtId/", async (response, request) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM 
    district 
    WHERE 
    district_id = ${districtId};`;

  await db.run(deleteBookQuery);
  response.send("District Removed");
});

//API 7
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateDistrictQuery = `
    UPDATE district 
    SET 
    districtName = '${districtName}',
    stateId = '${state}',
    cases = '${cases}',
    cured = '${cured}',
    active = '${active}', 
    deaths = '${deaths}',
    WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Update");
});

//API 8
module.exports = app;
