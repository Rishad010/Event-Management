const placeholderImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487528278747-040b63b2cdf2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
];

const SERVER_BASE = process.env.REACT_APP_SERVER_BASE || 'http://localhost:5000';

/**
 * Returns the event's image if it exists, otherwise returns a consistent placeholder
 * based on the event's ID.
 * @param {object} event - The event object.
 * @returns {string} The URL of the image to display.
 */
export const getEventImage = (event) => {
  if (event?.image) {
    // If image is a full URL, use it directly. Otherwise, prepend server base URL.
    if (event.image.startsWith('http')) {
      return event.image;
    }
    return `${SERVER_BASE}/${event.image}`;
  }
  // Simple hashing function to get a consistent index from the event ID
  const hash = event._id
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % placeholderImages.length;
  return placeholderImages[index];
}; 