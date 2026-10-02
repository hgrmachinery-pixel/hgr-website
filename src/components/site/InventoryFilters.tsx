export function InventoryFilters({ brands, query, brand, status }: { brands: string[]; query: string; brand?: string; status?: string }) {
  return (
    <form className="inventory-filters" action="/used-excavators" method="get">
      <label>Search brand or model
        <input name="q" type="search" maxLength={100} defaultValue={query} />
      </label>
      <label>Brand
        <select name="brand" defaultValue={brand ?? ""}>
          <option value="">All brands</option>
          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
        </select>
      </label>
      <label>Status
        <select name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </label>
      <button type="submit" className="button button--primary">Search inventory</button>
      <a className="button button--quiet" href="/used-excavators">Clear filters</a>
    </form>
  );
}
