// kakao.maps.services 라이브러리 타입 보강
// SDK URL에 &libraries=services를 추가해야 사용 가능 (index.html 참조)

declare namespace kakao.maps {
  // SDK 부트스트랩 콜백. 라이브러리(services 등)까지 모두 준비되면 호출됨.
  function load(callback: () => void): void;

  namespace services {
    interface Address {
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    }

    interface Coord2AddressResult {
      address?: Address;
    }

    type Coord2AddressCallback = (result: Coord2AddressResult[], status: string) => void;

    class Geocoder {
      coord2Address(lng: number, lat: number, callback: Coord2AddressCallback): void;
    }

    // Places: 키워드 기반 장소 검색 (services 라이브러리에 포함)
    interface PlacesSearchResultItem {
      id: string;
      place_name: string;
      address_name: string;
      road_address_name: string;
      x: string; // longitude (string으로 내려옴)
      y: string; // latitude
    }

    type PlacesSearchCallback = (
      result: PlacesSearchResultItem[],
      status: string,
      pagination: unknown,
    ) => void;

    class Places {
      keywordSearch(query: string, callback: PlacesSearchCallback): void;
    }

    const Status: {
      readonly OK: string;
      readonly ZERO_RESULT: string;
      readonly ERROR: string;
    };
  }
}
