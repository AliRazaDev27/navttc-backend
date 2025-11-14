import mongoose from 'mongoose';

const db = async () => {
  const db = await mongoose.connect(`${process.env.MONGO_URL}`);
  console.log(`connected to db ${db.connection.db}`)
}
export default db;