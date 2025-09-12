import { Knex } from "knex";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export async function seed(knex: Knex): Promise<void> {
  // first we need to clear available data
  await knex("airports").del();

  const airports: any[] = [];
  const filePath = path.join(__dirname, "..", "data", "airports.csv");

  await new Promise<void>((resolve, reject) => {
    const readAirportsStream = fs.createReadStream(filePath);

    readAirportsStream
      .pipe(csv())
      .on("data", (row) => {
        if (row.ident && row.type === "large_airport") {
          airports.push({
            icao_code: row.ident,
            name: row.name,
            city: row.municipality || null,
            country: row.iso_country || null,
            latitude: row.latitude_deg,
            longitude: row.longitude_deg,
          });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (airports.length > 0) {
    await knex("airports").insert(airports);
  }

  console.log(`Imported ${airports.length} airports from seed in database.`);
}
