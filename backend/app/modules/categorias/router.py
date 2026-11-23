from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, _: AdminUser, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(categoria_id: int, data: CategoriaUpdate, _: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, _: AdminUser, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
