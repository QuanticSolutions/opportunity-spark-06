import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (location) params.set("location", location);
    navigate(`/opportunities?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-stretch gap-0 rounded-2xl border border-border bg-card shadow-[var(--search-shadow)] overflow-hidden transition-shadow duration-300 focus-within:shadow-[var(--card-shadow-hover)]"
    >
      {/* Search input */}
      <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b sm:border-b-0 sm:border-r border-border">
        <Search size={20} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search jobs, scholarships, keywords..."
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Location input */}
      <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b sm:border-b-0 sm:border-r border-border">
        <MapPin size={20} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Location"
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Search button */}
      <div className="p-2">
        <Button
          type="submit"
          className="btn-gradient font-semibold rounded-xl h-full w-full sm:w-auto px-8 gap-2"
        >
          <Search size={16} />
          Search
        </Button>
      </div>
    </form>
  );
}
