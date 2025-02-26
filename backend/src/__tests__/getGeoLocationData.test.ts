import getGeoLocationData from '../utils/getGeoLocation';
import axios from 'axios';

jest.mock('axios');

describe('getGeoLocationData', () => {
  it('should return lat and lng when response is valid', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 43.6798345,
                lng: -79.6283834,
              },
            },
          },
        ],
      },
    });

    const result = await getGeoLocationData("Toronto Pearson Int'l");
    expect(result).toEqual({ lat: 43.6798345, lng: -79.6283834 });
  });
});
