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

    const Status: {
      readonly OK: string;
      readonly ZERO_RESULT: string;
      readonly ERROR: string;
    };
  }
}
