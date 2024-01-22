"use client"
import { useEffect, useState } from "react"

const Select = ({ options, value, onChange }) => {
  return (
    <select style={{ color: "black" }} value={value} onChange={onChange}>
      {options?.map((e) => (
        <option disabled={e.disabled} key={e.value} value={e.value}>
          {e.label}
        </option>
      ))}
    </select>
  )
}

const Filters = () => {
  const defaultOptions = {
    vehicles: { value: "carro", label: "Carro" },
    automakers: {
      value: "montadora*",
      label: "Montadora",
    },
    years: { value: "ano*", label: "Ano" },
    models: { value: "modelo*", label: "Modelo" },
    cylinderCapacity: {
      value: "cilindrada*",
      label: "Cilindrada",
    },
    engineBlock: {
      value: "bloco de motor*",
      label: "Bloco de motor",
    },
    typeOfProducts: {
      value: "tipo de produto*",
      label: "Tipo de produto",
    },
  }

  const firstValuesToOptions = {
    vehicles: {
      selected: defaultOptions.vehicles.value,
      options: [
        defaultOptions.vehicles,
        { value: "empilhadeira", label: "Empilhadeira" },
        { value: "van", label: "Van" },
      ],
    },
    automakers: {
      selected: defaultOptions.automakers.value,
      options: [defaultOptions.automakers],
    },
    years: {
      selected: defaultOptions.years.value,
      options: [defaultOptions.years],
    },
    models: {
      selected: defaultOptions.models.value,
      options: [defaultOptions.models],
    },
    cylinderCapacity: {
      selected: defaultOptions.cylinderCapacity.value,
      options: [defaultOptions.cylinderCapacity],
    },
    engineBlock: {
      selected: defaultOptions.engineBlock.value,
      options: [defaultOptions.engineBlock],
    },
    typeOfProducts: {
      selected: defaultOptions.typeOfProducts.value,
      options: [defaultOptions.typeOfProducts],
    },
  }

  const [options, setOptions] = useState(firstValuesToOptions)

  const url = "https://app.etonini.com.br"

  const requests = {
    async getAutomakers() {
      const endpoint = {
        carro: `${url}/CPA?op=002`,
        van: `${url}/CPA?op=002`,
        empilhadeira: `${url}/CPA?op=002&tipo=E`,
      }

      const automakers = await (
        await fetch(endpoint[options.vehicles.selected])
      ).json()

      const automakersOptions = automakers.map((item) => ({
        value: item.MONTADORA,
        label: item.MONTADORA,
      }))

      return automakersOptions
    },

    async getYears(automaker) {
      const endpoint = `${url}/CPA?op=003&montadora=${automaker}`

      const years = await (await fetch(endpoint)).json()

      const yearsOptions = years.map((item) => ({
        value: item.ANO,
        label: item.ANO,
      }))

      return yearsOptions
    },

    async getModels(automaker, year) {
      const endpoint = `${url}/CPA?op=004&montadora=${automaker}&ano=${year}`

      const models = await (await fetch(endpoint)).json()

      const modelsOptions = models.map((item) => ({
        value: item.MODELO,
        label: item.MODELO,
      }))

      return modelsOptions
    },

    async getCylinderCapacity(automaker, year, model) {
      const endpoint = `${url}/CPA?op=005&montadora=${automaker}&ano=${year}&modelo=${model}`
      const cylinderCapacity = await (await fetch(endpoint)).json()

      const cylinderCapacityOptions = cylinderCapacity.map((item) => ({
        value: `${item.MOTORIZACAO}|${item.COMBUSTIVEL}`,
        label: `${item.MOTORIZACAO} ${item.COMBUSTIVEL}`,
      }))

      return cylinderCapacityOptions
    },

    async getEngineBlock(automaker, year, model, cylinderCapacity) {
      const endpoint = `${url}/CPA?op=007&montadora=${automaker}&ano=${year}&modelo=${model}&motor=${cylinderCapacity}`
      const engineBlock = await (await fetch(endpoint)).json()

      const engineBlockOptions = engineBlock.map((item) => ({
        value: item.BLOCO,
        label: item.BLOCO,
      }))

      return engineBlockOptions
    },

    async getTypeOfProduct(
      automaker,
      year,
      model,
      cylinderCapacity,
      engineBlock
    ) {
      const endpoint = `${url}/CPA?op=011&montadora=${automaker}&ano=${year}&modelo=${model}&motor=${cylinderCapacity}&bloco=${engineBlock}`
      console.log(endpoint)

      const typeOfProducts = await (await fetch(endpoint)).json()

      const typeOfProductsOptions = typeOfProducts.map((item) => ({
        value: item.TIPO,
        label: item.TIPO,
      }))

      return typeOfProductsOptions
    },
  }

  const resetAllForwardSelects = (selectName) => {
    const forwardsSelects = Object.fromEntries(
      Object.entries(firstValuesToOptions).filter((_, i, arr) => {
        const indexTarget = arr.findIndex((e) => e[0] === selectName)

        return i > indexTarget
      })
    )
    setOptions((data) => ({ ...data, ...forwardsSelects }))
  }

  const pushOptions = (object) => {
    const [key] = Object.keys(object)
    const values = object[key]

    const translatedKey = {
      automakers: "Montadora",
      years: "ano",
      models: "modelo",
      cylinderCapacity: "cilindrada",
      engineBlock: "bloco de motor",
      typeOfProducts: "produtos",
    }

    const emptyValue = [
      {
        value: `Não há ${translatedKey[key]}*`,
        label: `Não há ${translatedKey[key]}`,
        disabled: "disabled",
      },
    ]

    const arrayToUse = values.length === 0 ? emptyValue : values

    setOptions((data) => ({
      ...data,
      [key]: {
        selected: defaultOptions[key].value,
        options: [defaultOptions[key], ...arrayToUse],
      },
    }))
  }

  const previousSelectIsNotSelectedDefaultValue = (select) => {
    return !options[select].selected.includes("*")
  }

  const { vehicles, automakers, years, models, cylinderCapacity, engineBlock } =
    options

  useEffect(() => {
    // INITIALIZE THE FIRST OPTIONS (for select automakers)
    requests.getAutomakers().then((automakers) => {
      pushOptions({ automakers })
    })
  }, [vehicles.selected])

  useEffect(() => {
    // GET YEARS
    resetAllForwardSelects("automakers")

    if (previousSelectIsNotSelectedDefaultValue("automakers")) {
      requests.getYears(automakers.selected).then((years) => {
        pushOptions({ years })
      })
    }
  }, [automakers.selected])

  // IF THE VEHICLE IS A "EMPILHADEIRA" THERE WILL BE NO YEARS
  useEffect(() => {
    // GET MODELS
    resetAllForwardSelects("years")

    if (previousSelectIsNotSelectedDefaultValue("years")) {
      requests.getModels(automakers.selected, years.selected).then((models) => {
        pushOptions({ models })
      })
    }
  }, [years.selected])

  useEffect(() => {
    // GET CYLINDER CAPACITY
    resetAllForwardSelects("models")

    if (previousSelectIsNotSelectedDefaultValue("models")) {
      requests
        .getCylinderCapacity(
          automakers.selected,
          years.selected,
          models.selected
        )
        .then((cylinderCapacity) => {
          pushOptions({ cylinderCapacity })
        })
    }
  }, [models.selected])

  useEffect(() => {
    // GET ENGINE BLOCK
    resetAllForwardSelects("cylinderCapacity")

    if (previousSelectIsNotSelectedDefaultValue("cylinderCapacity")) {
      requests
        .getEngineBlock(
          automakers.selected,
          years.selected,
          models.selected,
          cylinderCapacity.selected
        )
        .then((engineBlock) => {
          pushOptions({ engineBlock })
        })
    }
  }, [cylinderCapacity.selected])

  useEffect(() => {
    // GET ENGINE BLOCK
    resetAllForwardSelects("engineBlock")

    if (previousSelectIsNotSelectedDefaultValue("engineBlock")) {
      requests
        .getTypeOfProduct(
          automakers.selected,
          years.selected,
          models.selected,
          cylinderCapacity.selected,
          engineBlock.selected
        )
        .then((typeOfProducts) => {
          pushOptions({ typeOfProducts })
        })
    }
  }, [engineBlock.selected])

  return (
    <div className="container">
      <label>
        BUSQUE
        <br />
        POR VEÍCULO
      </label>
      <div className="filters">
        {Object.entries(options).map((option) => {
          const newOptions = option[option.length - 1].options

          return (
            <Select
              key={option[0]}
              options={newOptions}
              onChange={(e) => {
                const value = e.target.value

                // const isForkLift =
                //   option[0] === "vehicles" && value === "empilhadeira"

                // const dataToPopulate = {
                //   ...options,
                //   [option[0]]: {
                //     selected: value,
                //     options: options[option[0]].options,
                //   },
                // }

                // if (isForkLift) {
                //   console.log(dataToPopulate)
                //   delete dataToPopulate.years
                // }
                // setOptions(dataToPopulate)

                setOptions((data) => ({
                  ...data,
                  [option[0]]: {
                    selected: value,
                    options: data[option[0]].options,
                  },
                }))
              }}
              value={option[option.length - 1].selected}
            />
          )
        })}
      </div>
      <button style={{ color: "black" }} className="searchButton"></button>
    </div>
  )
}

export default Filters
