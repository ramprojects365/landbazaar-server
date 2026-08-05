import pkg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const parsedPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const isUrlConnection = Boolean(databaseUrl);

const client = new Client(
  isUrlConnection
    ? {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parsedPort,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'auth_db',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
);

const baseUserPassword = 'ram123';

const seedUsers = [
  {
    username: 'landowner_hyd',
    email: 'landowner.hyd@example.com',
    phone: '+919901112223'
  },
  {
    username: 'investor_wgl',
    email: 'investor.wgl@example.com',
    phone: '+919902223334'
  }
];

const seedProperties = [
  {
    ownerEmail: 'landowner.hyd@example.com',
    title: 'HMDA Approved Plot Near ORR - Shadnagar',
    description:
      'Clear title open plot with 30ft road access. Suitable for immediate residential construction.',
    listingType: 'sale',
    propertyType: 'HMDA Approved Plot',
    tenure: 'freehold',
    propertyName: 'Green Valley Venture',
    streetName: 'Kukatpally Main Road',
    cityName: 'Hyderabad',
    state: 'Telangana',
    county: 'Rangareddy',
    pincode: '500072',
    landmark: 'Near ORR Exit 12',
    location: 'Kukatpally, Hyderabad, Telangana',
    latitude: 17.494,
    longitude: 78.399,
    price: 5000000,
    landSize: 200,
    areaUnit: 'Square Yard',
    pricePerUnit: 25000,
    totalPrice: 5000000,
    facingDirection: 'North',
    cornerPlot: 'Yes',
    roadWidth: '30 ft',
    surveyNumber: '124/A',
    approvalTypes: ['HMDA', 'RERA'],
    soilType: 'Red Soil',
    clearTitle: 'Yes',
    loanFacility: 'Available',
    registrationReady: 'Yes',
    contactPersonName: 'Ravi Kumar',
    contactNumber: '+919876543210',
    amenities: {
      lifestyle: [],
      facilities: ['CC Road', 'Street Lights', 'Drainage'],
      security: []
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        fileName: 'plot-1.jpg',
        order: 1,
        category: 'frontage',
        displayPlace: 'Frontage',
        caption: 'Road-facing view',
        isCover: true
      }
    ]
  },
  {
    ownerEmail: 'landowner.hyd@example.com',
    title: 'Open Agricultural Land - Yadadri Belt',
    description: 'Fertile agricultural parcel with irrigation access and clean records.',
    listingType: 'sale',
    propertyType: 'Agricultural Land',
    tenure: 'freehold',
    propertyName: 'Sri Lakshmi Farms',
    streetName: 'NH163 Service Road',
    cityName: 'Yadadri',
    state: 'Telangana',
    county: 'Yadadri Bhuvanagiri',
    pincode: '508115',
    landmark: '5 km from Yadadri Temple',
    location: 'Yadadri, Telangana',
    latitude: 17.586,
    longitude: 78.943,
    price: 3200000,
    landSize: 1210,
    areaUnit: 'Square Yard',
    pricePerUnit: 2645,
    totalPrice: 3200000,
    facingDirection: 'East',
    cornerPlot: 'No',
    roadWidth: '24 ft',
    surveyNumber: '45/B',
    approvalTypes: ['MRO'],
    soilType: 'Black Soil',
    clearTitle: 'Yes',
    loanFacility: 'Not Available',
    registrationReady: 'Yes',
    contactPersonName: 'Ravi Kumar',
    contactNumber: '+919876543210',
    amenities: {
      lifestyle: [],
      facilities: ['Bore Water'],
      security: []
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
        fileName: 'farm-plot.jpg',
        order: 1,
        category: 'other',
        displayPlace: 'Aerial View',
        caption: 'Agricultural section overview',
        isCover: true
      }
    ]
  },
  {
    ownerEmail: 'investor.wgl@example.com',
    title: 'DTCP Plot Package - Warangal Outskirts',
    description:
      'DTCP approved plots in gated venture. Internal roads and electric poles available.',
    listingType: 'sale',
    propertyType: 'DTCP Approved Plot',
    tenure: 'freehold',
    propertyName: 'Urban Nest Phase 2',
    streetName: 'Kazipet Ring Road',
    cityName: 'Warangal',
    state: 'Telangana',
    county: 'Hanamkonda',
    pincode: '506001',
    landmark: 'Near Outer Ring Proposal Road',
    location: 'Kazipet, Warangal, Telangana',
    latitude: 17.972,
    longitude: 79.594,
    price: 2100000,
    landSize: 150,
    areaUnit: 'Square Yard',
    pricePerUnit: 14000,
    totalPrice: 2100000,
    facingDirection: 'West',
    cornerPlot: 'Yes',
    roadWidth: '33 ft',
    surveyNumber: '301/2',
    approvalTypes: ['DTCP'],
    soilType: 'Mixed',
    clearTitle: 'Yes',
    loanFacility: 'Available',
    registrationReady: 'Yes',
    contactPersonName: 'Anusha Reddy',
    contactNumber: '+919887766554',
    amenities: {
      lifestyle: [],
      facilities: ['CC Road', 'Street Lights', 'Underground Drainage'],
      security: ['Gated Entry']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
        fileName: 'dtcp-plot.jpg',
        order: 1,
        category: 'frontage',
        displayPlace: 'Frontage',
        caption: 'Main entrance and road',
        isCover: true
      }
    ]
  }
];

async function ensureLandColumns() {
  await client.query(`
    ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS land_size NUMERIC(10,2),
      ADD COLUMN IF NOT EXISTS area_unit VARCHAR(30),
      ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(15,2),
      ADD COLUMN IF NOT EXISTS total_price NUMERIC(15,2),
      ADD COLUMN IF NOT EXISTS facing_direction VARCHAR(100),
      ADD COLUMN IF NOT EXISTS corner_plot VARCHAR(10),
      ADD COLUMN IF NOT EXISTS road_width VARCHAR(30),
      ADD COLUMN IF NOT EXISTS survey_number VARCHAR(120),
      ADD COLUMN IF NOT EXISTS approval_types JSONB,
      ADD COLUMN IF NOT EXISTS soil_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS clear_title VARCHAR(10),
      ADD COLUMN IF NOT EXISTS loan_facility VARCHAR(30),
      ADD COLUMN IF NOT EXISTS registration_ready VARCHAR(10),
      ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20);
  `);
}

async function upsertUsers(passwordHash) {
  const userMap = new Map();

  for (const user of seedUsers) {
    const result = await client.query(
      `
      INSERT INTO users (username, email, phone_number, password_hash, email_verified)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email)
      DO UPDATE SET username = EXCLUDED.username, phone_number = EXCLUDED.phone_number
      RETURNING id, email;
      `,
      [user.username, user.email, user.phone, passwordHash]
    );

    userMap.set(result.rows[0].email, result.rows[0].id);
  }

  return userMap;
}

async function insertProperties(userMap) {
  await client.query('DELETE FROM properties;');

  for (const property of seedProperties) {
    const ownerId = userMap.get(property.ownerEmail);
    if (!ownerId) {
      continue;
    }

    await client.query(
      `
      INSERT INTO properties (
        title,
        description,
        listing_type,
        property_type,
        tenure,
        property_name,
        street_name,
        city_name,
        state,
        county,
        pincode,
        landmark,
        location,
        latitude,
        longitude,
        price,
        land_size,
        area_unit,
        price_per_unit,
        total_price,
        facing_direction,
        corner_plot,
        road_width,
        survey_number,
        approval_types,
        soil_type,
        clear_title,
        loan_facility,
        registration_ready,
        contact_person_name,
        contact_number,
        negotiable,
        amenities,
        images,
        status,
        user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25::jsonb, $26, $27, $28, $29, $30,
        $31, $32, $33::jsonb, $34::jsonb, $35, $36
      );
      `,
      [
        property.title,
        property.description,
        property.listingType,
        property.propertyType,
        property.tenure,
        property.propertyName,
        property.streetName,
        property.cityName,
        property.state,
        property.county,
        property.pincode,
        property.landmark,
        property.location,
        property.latitude,
        property.longitude,
        property.price,
        property.landSize,
        property.areaUnit,
        property.pricePerUnit,
        property.totalPrice,
        property.facingDirection,
        property.cornerPlot,
        property.roadWidth,
        property.surveyNumber,
        JSON.stringify(property.approvalTypes),
        property.soilType,
        property.clearTitle,
        property.loanFacility,
        property.registrationReady,
        property.contactPersonName,
        property.contactNumber,
        true,
        JSON.stringify(property.amenities),
        JSON.stringify(property.images),
        'active',
        ownerId
      ]
    );
  }
}

async function seedDatabase() {
  try {
    await client.connect();
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(baseUserPassword, 10);

    await ensureLandColumns();
    const userMap = await upsertUsers(passwordHash);
    await insertProperties(userMap);

    await client.query('COMMIT');

    console.log('Seed complete.');
    console.log('Demo login email: landowner.hyd@example.com');
    console.log('Demo login password: ram123');
  } catch (error) {
    await client.query('ROLLBACK');
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    console.error('Seed failed:', message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
