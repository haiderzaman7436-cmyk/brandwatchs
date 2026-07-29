import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDh9XihusSix89erKfOTHZEeUq3qyp05rw",
  authDomain: "brandwatches.firebaseapp.com",
  databaseURL: "https://brandwatches-default-rtdb.firebaseio.com",
  projectId: "brandwatches",
  storageBucket: "brandwatches.firebasestorage.app",
  messagingSenderId: "86001107680",
  appId: "1:86001107680:web:e04cd3989823dee9080685",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  await signInWithEmailAndPassword(auth, "admin@brandwatches.com", "Haider1111@");
  console.log("Logged in");

  const querySnapshot = await getDocs(collection(db, "products"));
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (data.brand === 'Rado') {
      await updateDoc(doc(db, "products", document.id), {
        images: [
          '/images/product-1.jpeg',
          '/images/product-2.jpeg',
          '/images/product-3.jpeg',
          '/images/product-4.jpeg',
          '/images/product-8.jpeg'
        ]
      });
      console.log('Updated Rado');
    } else if (data.brand === 'Matturi') {
      await updateDoc(doc(db, "products", document.id), {
        images: [
          '/images/product-5.jpeg',
          '/images/product-6.jpeg',
          '/images/product-7.jpeg',
          '/images/product-9.jpeg'
        ]
      });
      console.log('Updated Matturi');
    } else if (data.brand === 'Tissot') {
      await updateDoc(doc(db, "products", document.id), {
        images: [
          '/images/product-10.jpeg',
          '/images/product-11.jpeg',
          '/images/product-12.jpeg',
          '/images/product-13.jpeg',
          '/images/product-14.jpeg',
          '/images/product-15.jpeg',
          '/images/product-16.jpeg'
        ]
      });
      console.log('Updated Tissot');
    }
  }
  console.log("Done!");
  process.exit(0);
}
run();
