# Seed Data Documentation

## Overview
The database has been populated with dummy data for development and testing purposes.

## Running the Seed Script

```bash
cd backend
npm run seed
```

This will clear existing data and populate the database with:

## Test Accounts

### Admin Account
- **Email:** admin@vanuatu.com
- **Password:** password123
- **Role:** admin

### Host Accounts
1. **Host 1**
   - **Email:** host1@vanuatu.com
   - **Password:** password123
   - **Role:** host
   - **Properties:** The Havannah Vanuatu, Warwick Le Lagon Resort

2. **Host 2**
   - **Email:** host2@vanuatu.com
   - **Password:** password123
   - **Role:** host
   - **Properties:** Coconut Palms Resort, Espiritu Hideaway, Port Vila Central Apartments

### Customer Accounts
1. **Customer 1**
   - **Email:** customer1@example.com
   - **Password:** password123
   - **Role:** customer

2. **Customer 2**
   - **Email:** customer2@example.com
   - **Password:** password123
   - **Role:** customer

## Seeded Data

### Properties (5 total)

1. **The Havannah Vanuatu** - 5-star luxury resort
   - Location: Port Vila, Shefa
   - Type: Adults-only resort
   - Price: $450-$750/night
   - Features: Private bungalows, spa, private beach

2. **Warwick Le Lagon Resort** - 4-star family resort
   - Location: Port Vila, Shefa
   - Type: Family-friendly beachfront resort
   - Price: $180-$280/night
   - Features: Multiple pools, kids club, water slides

3. **Coconut Palms Resort** - 3-star beachfront
   - Location: Mele Bay, Port Vila
   - Type: Affordable resort
   - Price: $120/night
   - Features: Traditional bungalows, beach access

4. **Espiritu Hideaway** - 4-star boutique hotel
   - Location: Luganville, Sanma
   - Type: Dive-focused boutique hotel
   - Price: $150-$220/night
   - Features: Dive center, close to SS President Coolidge wreck

5. **Port Vila Central Apartments** - 3-star apartments
   - Location: Port Vila city center
   - Type: Self-contained apartments
   - Price: $95-$145/night
   - Features: Full kitchens, city location

### Flights (4 total)

1. **NF101** - Air Vanuatu
   - Route: Sydney (SYD) → Port Vila (VLI)
   - Price: $420 (Economy), $1,200 (Business)
   - International flight

2. **NF102** - Air Vanuatu
   - Route: Port Vila (VLI) → Sydney (SYD)
   - Price: $445 (Economy), $1,250 (Business)
   - Return flight

3. **NF201** - Air Vanuatu
   - Route: Port Vila (VLI) → Luganville (SON)
   - Price: $120 (Economy only)
   - Domestic flight

4. **QF245** - Qantas
   - Route: Brisbane (BNE) → Port Vila (VLI)
   - Price: $395 (Economy), $1,100 (Business)
   - International flight

### Services (5 total)

1. **Blue Lagoon & Cascades Tour**
   - Category: Tour
   - Duration: 6 hours
   - Price: $85
   - Capacity: 15 people
   - Includes: Hotel pickup, lunch, entrance fees

2. **Scuba Diving - Beginner**
   - Category: Diving
   - Duration: 3 hours
   - Price: $120
   - Capacity: 6 people
   - Perfect for first-time divers

3. **SS President Coolidge Wreck Dive**
   - Category: Diving
   - Duration: 4 hours
   - Price: $180
   - Capacity: 8 people
   - For certified divers only

4. **Island Hopping Adventure**
   - Category: Tour
   - Duration: 8 hours
   - Price: $145
   - Capacity: 20 people
   - Available: Mon, Wed, Fri

5. **Sunset Cruise**
   - Category: Tour
   - Duration: 2 hours
   - Price: $95
   - Capacity: 30 people
   - Includes: Champagne, canapés, live music

## Map Coordinates

All properties have accurate coordinates in Vanuatu:
- **Port Vila** (capital): ~17.7°S, 168.3°E
- **Luganville** (2nd city): ~15.5°S, 167.2°E

The map feature will display properties at their correct locations.

## Notes

- **Bookings and Reviews** are intentionally not seeded
  - These should be created through the application's normal booking flow
  - This ensures data integrity and proper validation
  - Test creating bookings through the UI with the customer accounts

- **Payment Information** is not included in seed data
  - Payment methods should be added through the application

- **Images** use Unsplash placeholder images
  - Replace with actual property images in production

## Resetting Data

To reset and reseed the database:

```bash
npm run seed
```

⚠️ **Warning:** This will delete all existing data in the database.

## Development Tips

1. Use the customer accounts to test booking flows
2. Use host accounts to manage properties
3. Use admin account for system administration
4. All properties have rooms marked as available
5. Flight dates are set to tomorrow and next week for testing
