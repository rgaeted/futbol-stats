-- Agregar columna user_id a la tabla players
alter table players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Eliminar la política permisiva anterior
drop policy if exists "public_access" on players;

-- Cualquiera puede leer todas las cartas (fotos ocultas por la app, no por la BD)
create policy "select_all"
  on players for select
  using (true);

-- Solo usuarios autenticados pueden insertar sus propias cartas
create policy "insert_own"
  on players for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Solo el dueño puede editar su carta
create policy "update_own"
  on players for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Solo el dueño puede eliminar su carta
create policy "delete_own"
  on players for delete
  to authenticated
  using (auth.uid() = user_id);
