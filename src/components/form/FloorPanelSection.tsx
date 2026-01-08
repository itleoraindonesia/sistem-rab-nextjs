import { UseFormRegister, FieldErrors, UseFieldArrayRemove, UseFieldArrayAppend, FieldArrayWithId } from "react-hook-form";
import { RABFormData } from "../../schemas/rabSchema";

interface FloorPanel {
  panel_id: number;
  panel_name: string;
  area: number;
  price_per_m2: number;
}

interface FloorPanelSectionProps {
  register: UseFormRegister<RABFormData>;
  errors: FieldErrors<RABFormData>;
  watchedValues: Partial<RABFormData>;
  panels: any[];
  fields: FieldArrayWithId<RABFormData, "bidang">[];
  remove: UseFieldArrayRemove;
  tambahBidang: () => void;
}

export default function FloorPanelSection({
  register,
  errors,
  watchedValues,
  panels,
  fields,
  remove,
  tambahBidang,
}: FloorPanelSectionProps) {
  const floorPanels = panels.filter(p => p.category === 'floor');

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  return (
    <div className="bg-surface rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-brand-accent">🏠</span>
            Panel Lantai
          </h2>
          <button
            type="button"
            onClick={tambahBidang}
            className="bg-brand-primary hover:bg-brand-dark text-white px-3 py-1 rounded text-sm"
          >
            + Tambah Bidang
          </button>
        </div>
      </div>

      <div className="p-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <div className="text-4xl mb-2">🏠</div>
            <p>Belum ada bidang panel lantai</p>
            <p className="text-sm">Klik "Tambah Bidang" untuk menambah</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const panjang = watchedValues.bidang?.[index]?.panjang || 0;
              const lebar = watchedValues.bidang?.[index]?.lebar || 0;
              const luas = panjang * lebar;

              return (
                <div key={field.id} className="border border-default rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Bidang {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-error hover:text-error-dark text-sm"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Panjang (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        {...register(`bidang.${index}.panjang` as const, {
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 border border-secondary rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        placeholder="0.0"
                      />
                      {errors.bidang?.[index]?.panjang && (
                        <p className="text-error text-sm mt-1">
                          {errors.bidang[index]?.panjang?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Lebar (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        {...register(`bidang.${index}.lebar` as const, {
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 border border-secondary rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        placeholder="0.0"
                      />
                      {errors.bidang?.[index]?.lebar && (
                        <p className="text-error text-sm mt-1">
                          {errors.bidang[index]?.lebar?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-surface-muted rounded">
                    <div className="text-sm text-muted">
                      <div>Panjang: {panjang} m</div>
                      <div>Lebar: {lebar} m</div>
                      <div className="font-semibold text-brand-primary">
                        Luas: {luas.toFixed(2)} m²
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
