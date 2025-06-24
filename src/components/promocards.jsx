// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

// const { width } = Dimensions.get('window');

// const PromoCard = () => {
//   return (
//     <View style={styles.card}>
//       <View style={styles.textSection}>
//         <Text style={styles.title}>
//           PREMIUM CUTS,<Text style={styles.highlight}> UNMATCHED TASTE!</Text>
//         </Text>
//         <Text style={styles.subtitle}>
//           Juicy cuts, delivered right to your doorstep.
//         </Text>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Order Now</Text>
//         </TouchableOpacity>
//       </View>
//       <Image
//         source={require('../screens/daddy/tabassets/promopic.png')} // <-- replace with your image path
//         style={styles.image}
//       />

//       {/* Carousel Dots */}
//       <View style={styles.dotsContainer}>
//         <View style={[styles.dot, styles.activeDot]} />
//         <View style={styles.dot} />
//         <View style={styles.dot} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#8B0000', // deep red
//     borderRadius: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     width: width - 30,
//     alignSelf: 'center',
//     marginVertical: 10,
//     position: 'relative',
//   },
//   textSection: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   title: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   highlight: {
//     color: '#FF4C4C', // bright red for "UNMATCHED TASTE"
//   },
//   subtitle: {
//     color: '#f8f8f8',
//     marginVertical: 8,
//     fontSize: 14,
//   },
//   button: {
//     backgroundColor: '#FFD700',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   buttonText: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   image: {
//     width: 90,
//     height: 90,
//     borderRadius: 10,
//     resizeMode: 'cover',
//   },
//   dotsContainer: {
//     position: 'absolute',
//     bottom: -15,
//     left: '45%',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#ccc',
//     marginHorizontal: 3,
//   },
//   activeDot: {
//     backgroundColor: '#FF4C4C',
//     width: 10,
//   },
// });

// export default PromoCard;
// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ImageBackground,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// const images = [
//   require('../screens/daddy/tabassets/promopic.png'),
//   require('../screens/daddy/tabassets/promopic.png'),
//   require('../screens/daddy/tabassets/promopic.png'),
// ];

// const PromoCard = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef(null);
//   const autoScrollRef = useRef(null); // To store the interval ID for auto-scroll

//   // Auto-scroll logic
//   useEffect(() => {
//     // Start auto-scrolling every 3 seconds
//     autoScrollRef.current = setInterval(() => {
//       const nextIndex = (currentIndex + 1) % images.length; // Loop back to 0
//       setCurrentIndex(nextIndex);
//       flatListRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//     }, 3000); // Adjust interval (3000ms = 3 seconds)

//     // Cleanup interval on component unmount
//     return () => clearInterval(autoScrollRef.current);
//   }, [currentIndex, images.length]);

//   // Handle manual scroll to update currentIndex
//   const handleScroll = event => {
//     const totalCardWidth = 300 + 5; // Card width + marginRight
//     const index = Math.round(event.nativeEvent.contentOffset.x / totalCardWidth);
//     setCurrentIndex(index);
//   };

//   // Optional: Stop auto-scroll on user interaction
//   const handleTouchStart = () => {
//     clearInterval(autoScrollRef.current); // Pause auto-scroll
//   };

//   // Optional: Resume auto-scroll after user interaction
//   const handleTouchEnd = () => {
//     autoScrollRef.current = setInterval(() => {
//       const nextIndex = (currentIndex + 1) % images.length;
//       setCurrentIndex(nextIndex);
//       flatListRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//     }, 3000);
//   };

//   const subtitleText = 'Juicy cuts, delivered right to your doorstep.';
//   const words = subtitleText.split(' ');
//   const subtitleLines = [];
//   for (let i = 0; i < words.length; i += 3) {
//     subtitleLines.push(words.slice(i, i + 3).join(' '));
//   }

//   const renderItem = ({ item }) => (
//     <ImageBackground
//       source={item}
//       style={styles.card}
//       imageStyle={styles.backgroundImage}>
//       <View style={styles.overlay} />
//       <View style={styles.contentContainer}>
//         <View style={styles.textSection}>
//           <Text style={styles.title}>PREMIUM CUTS</Text>
//           <Text style={styles.highlight}>UNMATCHED TASTE!</Text>
//           <View>
//             {subtitleLines.map((line, index) => (
//               <Text key={index} style={styles.subtitle}>
//                 {line}
//               </Text>
//             ))}
//           </View>
//           <TouchableOpacity style={styles.button}>
//             <Text style={styles.buttonText}>Order Now</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ImageBackground>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={images}
//         renderItem={renderItem}
//         keyExtractor={(_, index) => index.toString()}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         onScroll={handleScroll}
//         snapToInterval={300 + 10} // Card width + marginRight
//         snapToAlignment="start"
//         decelerationRate="fast"
//         contentContainerStyle={styles.flatListContent}
//         onTouchStart={handleTouchStart} // Pause on touch
//         onTouchEnd={handleTouchEnd} // Resume on touch release
//         getItemLayout={(data, index) => ({
//           length: 300 + 10,
//           offset: (300 + 10) * index,
//           index,
//         })} // Optimize scrollToIndex
//       />

//       {/* Dots */}
//       <View style={styles.dotsContainer}>
//         {images.map((_, index) => (
//           <View
//             key={index}
//             style={[styles.dot, index === currentIndex ? styles.activeDot : null]}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   card: {
//     width: 361, // Reduced from 350 to show more of the next card
//     height: 188,
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginTop: 16,
//     padding: 16,
//     marginRight: 20, // Reduced from 20 for tighter spacing
//   },
//   backgroundImage: {
//     resizeMode: 'cover',
//     borderRadius: 15,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(139, 0, 0, 0.1)',
//   },
//   contentContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   textSection: {
//     // Removed flex: 1 to allow natural sizing
//   },
//   title: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: '400',
//   },
//   highlight: {
//     fontSize: 20,
//     color: '#D32F2F', // Changed from #FF4C4C
//     fontWeight: '700',
//   },
//   subtitle: {
//     color: '#f8f8f8',
//     fontSize: 14,
//     lineHeight: 20,
//     fontWeight: '400',
//     marginVertical: 2,
//   },
//   button: {
//     backgroundColor: '#FFD700',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//     marginTop: 1,
//     marginBottom: 8,
//   },
//   buttonText: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   flatListContent: {
//     paddingLeft: 20, // Adjusted to show card on left
//     paddingRight: 20, // Adjusted to show partial next card
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#EF9A9A', // Changed from #EB9F9F
//     marginHorizontal: 3,
//   },
//   activeDot: {
//     backgroundColor: '#D32F2F', // Changed from #C02B2B
//     width: 19,
//   },
// });

// export default PromoCard;
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { getBanners } from '../services/services';

const { width } = Dimensions.get('window');

// Define padding values
const PADDING_HORIZONTAL = 12; // Left and right padding
const CARD_WIDTH = width - 2 * PADDING_HORIZONTAL; // Card width matches screen width minus padding

const PromoCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Fetch banners on mount
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        const fetchedBanners = await getBanners();
        setBanners(fetchedBanners);
        setError(null);
      } catch (err) {
        setError('Failed to load banners');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (banners.length <= 1) return; // Prevent scrolling if no banners or only one
    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(autoScrollRef.current);
  }, [currentIndex, banners.length]);

  // Handle manual scroll to update currentIndex
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    setCurrentIndex(index);
  };

  // Pause auto-scroll on user interaction
  const handleTouchStart = () => {
    clearInterval(autoScrollRef.current);
  };

  // Resume auto-scroll after user interaction
  const handleTouchEnd = () => {
    if (banners.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ImageBackground
        source={{ uri: item.banner_image }}
        style={styles.card}
        imageStyle={styles.backgroundImage}
        defaultSource={{ uri: 'https://via.placeholder.com/300' }}
      />
    </View>
  );
  

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeltonCard}>
          <View style={styles.skeletonLeft}>
            <View style={styles.skeletonTextLarge} />
            <View style={styles.skeletonTextMedium} />
            <View style={styles.skeletonTextSmall} />
            <View style={styles.skeletonButton} />
          </View>
          <View style={styles.skeletonImage} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No banners available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH} // Snap to each card's width
        snapToAlignment="start" // Align to the start of each card
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
        scrollEventThrottle={16} // Optimize scroll performance
      />
      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex ? styles.activeDot : null]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 188,
    borderRadius: 15,
    overflow: 'hidden', // 🔥 This ensures image corners get clipped
    marginHorizontal: PADDING_HORIZONTAL / 2,
    backgroundColor: '#eee', // Optional placeholder background
  },
  card: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch', // or 'stretch' if needed
  },
  flatListContent: {
    paddingHorizontal: PADDING_HORIZONTAL / 2, // Adjusted to ensure proper card spacing
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF9A9A',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#8655d2',
    width: 19,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },


  skeltonCard: {
    flexDirection: 'row',
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    padding: 16,
    overflow: 'hidden',
  },
  skeletonLeft: {
    flex: 1.2,
    justifyContent: 'space-between',
  },
  skeletonTextLarge: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonTextMedium: {
    width: '70%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonTextSmall: {
    width: '90%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonButton: {
    width: 120,
    height: 40,
    backgroundColor: '#d6d6d6',
    borderRadius: 20,
  },
  skeletonImage: {
    flex: 1,
    backgroundColor: '#cccccc',
    marginLeft: 10,
    borderRadius: 10,
  },
});

export default PromoCard;