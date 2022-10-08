DROP TABLE IF EXISTS Location;
CREATE TABLE Location (
  name VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL,
  usesDiningDollars BOOLEAN NOT NULL,
  PRIMARY KEY (name)
);

DROP TABLE IF EXISTS Hours;
CREATE TABLE Hours (
  locationName VARCHAR(255) NOT NULL,
  start CHAR(4) NOT NULL,
  end CHAR(4) NOT NULL,
  FOREIGN KEY (locationName) REFERENCES Location(name)
);

DROP TABLE IF EXISTS MenuItemSection;
CREATE TABLE MenuItemSection (
  name VARCHAR(255) NOT NULL,
  locationName VARCHAR(255) NOT NULL,
  PRIMARY KEY (name, locationName),
  FOREIGN KEY (locationName) REFERENCES Location(name)
);

DROP TABLE IF EXISTS MenuItem;
CREATE TABLE MenuItem (
  name VARCHAR(255) NOT NULL,
  description TEXT,
  menuSection INTEGER NOT NULL,
  locationName VARCHAR(255) NOT NULL,
  PRIMARY KEY (locationName, menuSection, name),
  FOREIGN KEY (menuSection) REFERENCES MenuItemSection(id)
  FOREIGN KEY (locationName) REFERENCES Location(name)
);
