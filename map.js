const form = document.getElementById('hospitalForm');
    const mapElement = document.getElementById('map');
    const resultsElement = document.getElementById('results');
    const loadingElement = document.getElementById('loading');
    let map;

    // Initialize map
    function initializeMap(lat, lon) {
      if (!map) {
        map = L.map(mapElement).setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
      } else {
        map.setView([lat, lon], 12);
      }
      L.marker([lat, lon]).addTo(map).bindPopup('Your location').openPopup();
    }

    // Generate random points within a radius
    function generateRandomPoints(lat, lon, radiusInKm = 5) {
      const randomPoints = [];
      for (let i = 0; i < 4; i++) {
        const randomAngle = Math.random() * 2 * Math.PI; // Random angle
        const randomRadius = Math.random() * radiusInKm * 1000; // Random distance in meters

        const offsetLat = randomRadius * Math.cos(randomAngle) / 111320; // Convert meters to degrees latitude
        const offsetLon = randomRadius * Math.sin(randomAngle) / (111320 * Math.cos(lat * Math.PI / 180)); // Adjust for longitude

        randomPoints.push({ lat: lat + offsetLat, lon: lon + offsetLon });
      }
      return randomPoints;
    }

    // Handle form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      loadingElement.style.display = 'block';
      mapElement.style.display = 'none';
      resultsElement.style.display = 'none';

      const city = document.getElementById('city').value;

      try {
        // Geocode city to get coordinates
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`);
        const data = await response.json();
        if (data.length === 0) throw new Error('City not found');

        const { lat, lon } = data[0];
        initializeMap(parseFloat(lat), parseFloat(lon));

        // Generate and display random locations
        const randomLocations = generateRandomPoints(parseFloat(lat), parseFloat(lon));
        randomLocations.forEach(({ lat, lon }, index) => {
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`Random Location ${index + 1}`);
          const listItem = document.createElement('li');
          listItem.textContent = `Random Location ${index + 1}: Latitude ${lat.toFixed(6)}, Longitude ${lon.toFixed(6)}`;
          // resultsElement.appendChild(listItem);
        });

        loadingElement.style.display = 'none';
        mapElement.style.display = 'block';
        resultsElement.style.display = 'block';
      } catch (error) {
        console.error(error);
        alert('Error: Unable to load map for the provided location.');
        loadingElement.style.display = 'none';
      }
    });