import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Search, Bell, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Live Map', path: '/' },
  { label: 'Hotspots', path: '/ranking' },
  { label: 'Route Planner', path: '/route' },
];

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-1001">
      <div className="flex items-center justify-between h-16 px-6 md:px-8">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="size-5 text-white" />
          </div>
          <span className="font-bold text-lg">Dan-Burn-Go</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex gap-8">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 검색 (데스크탑) */}
          <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-48 xl:w-64">
            <Search className="size-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search hotspots..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          {/* 아이콘 (데스크탑) */}
          <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="size-5 text-gray-600" />
          </button>

          {/* 햄버거 (모바일) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="size-6 text-gray-600" />
            ) : (
              <Menu className="size-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <nav className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
