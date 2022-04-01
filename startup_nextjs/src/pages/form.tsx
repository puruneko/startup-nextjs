import { Fragment, useState, FC } from 'react'

import { SampleComponent } from 'components/sample_component'
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import styled from 'styled-components';
import { version } from 'os';

import { useDispatch } from 'react-redux'
import { useSelector } from 'redux/store'
import { counterAction, countSelector, callCountSelector, counterSelector } from 'redux/states/counter'

type InfoElemType<T> = {
    error: boolean,
    errorMsg: string,
    value: T | null,
}

type CovidInfoType = {
    belongs: InfoElemType<string>,
    name: InfoElemType<string>,
    reporterName: InfoElemType<string>,
    kind: InfoElemType<'協働者' | '社員'>,
    pcrDate: InfoElemType<Date>,
    pcrResult: InfoElemType<'陽性' | '陰性' | '未確定'>,
    pcrResultScheduledDate: InfoElemType<Date>,
    workLocation: InfoElemType<string>,
    lastArrivalDate: InfoElemType<Date>,
    lastArrivalLocation: InfoElemType<string>,
    closeContacts: InfoElemType<Number>,
}

const genInfoElem = <T extends {}>(value?: T) => {
    const v: T|null = value ? value : null
    const ret: InfoElemType<T> = {
        error: false,
        errorMsg: '',
        value: v,
    }
    return ret
}

const initCovidInfo: CovidInfoType = {
    belongs: genInfoElem(''),
    name: genInfoElem(''),
    reporterName: genInfoElem(''),
    kind: genInfoElem('協働者'),
    pcrDate: genInfoElem<Date>(),
    pcrResult: genInfoElem('未確定'),
    pcrResultScheduledDate: genInfoElem<Date>(),
    workLocation: genInfoElem(),
    lastArrivalDate: genInfoElem<Date>(),
    lastArrivalLocation: genInfoElem(''),
    closeContacts: genInfoElem(0),
}

const Form: FC = () => {

    //const count = useSelector(countSelector)
    //const callCount = useSelector(callCountSelector)
    const { count, callCount } = useSelector(counterSelector)
    const disptach = useDispatch()

    const [covidInfo, setCovidInfo] = useState<CovidInfoType>(initCovidInfo)

    const validation = (key: keyof CovidInfoType, value: any) => {
        let error = false
        let errorMsg = ''
        switch(key) {
            case 'pcrResultScheduledDate':
                //未確定の場合以外はチェック無視
                if (covidInfo.pcrResult.value !== '未確定') {
                    return {error, errorMsg}
                }
            default:
                if (value === null || value === undefined || (typeof(value) === typeof('') && value.trim() === '')) {
                    error = true
                    errorMsg = '必須入力項目です。'
                }
        }
        return {
            error, errorMsg
        }
    }
    const inputChangeEvent = (key: keyof CovidInfoType, value: any) => {
        const validationResult = validation(key, value)
        setCovidInfo({
            ...covidInfo,
            [key]: {
                ...validationResult,
                value: value
            },
        })
    }
    const checkAll = ():[boolean, CovidInfoType] => {
        let isError = false
        let covidInfoCopy: CovidInfoType = covidInfo
        for(let key of Object.keys(covidInfo)) {
            const k = key as keyof CovidInfoType
            //チェック結果をcopyに保存
            let vr = validation(k, covidInfo[k].value)
            covidInfoCopy = {
               ...covidInfoCopy,
               [k]: {
                    ...covidInfo[k],
                    ...vr,
                },
            }
            //チェックがエラーならフラグON
            if (vr.error) {
                isError = true
            }
        }
        return [isError, covidInfoCopy]
    }
    const getJsonString = () => {
        let dict: {[key: string]: any} = {}
        for (let key of Object.keys(covidInfo)) {
            const k = key as keyof CovidInfoType
            if (Object.prototype.toString.call(covidInfo[k].value) === '[object Date]') {
                dict[key] = (covidInfo[k].value as Date)?.toISOString()
            }
            else {
                dict[key] = covidInfo[k].value?.toString()
            }
        }
        return JSON.stringify(dict)
    }
    const submitEvent = () => {
        //errorチェック
        const [isError, info] = checkAll()
        //errorならerror表示
        if (isError) {
            console.log('チェックエラー発生')
            setCovidInfo(info)
            disptach(counterAction.sub(1))
        }
        //errorでないならsubmit
        else {
            //submit
            console.log('submit!')
            let body = getJsonString()
            const headers = {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            };
            console.log(body as BodyInit)
            fetch('http://10.32.192.56:4001/push', {method: 'POST', headers, body})
            .then(value => {
                console.log(value)
                disptach(counterAction.add(1))
            })
            .catch(e => {
                console.log(e)
                disptach(counterAction.sub(1))
            })
        }
    }

    return (
        <FormRoot>
            <h2>コロナ報告フォーム</h2>
            <h2>{count}</h2>
            <h2>{callCount}</h2>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="start"
                spacing={2}
            >
                <TextField
                    required
                    error={covidInfo.belongs.error}
                    helperText={covidInfo.belongs.errorMsg}
                    label="所属"
                    value={covidInfo.belongs.value}
                    onChange={(event) => {inputChangeEvent('belongs', event.target.value)}}
                />
                <TextField
                    required
                    error={covidInfo.name.error}
                    helperText={covidInfo.name.errorMsg}
                    label="対象者氏名"
                    value={covidInfo.name.value}
                    onChange={(event) => {inputChangeEvent('name', event.target.value)}}
                />
                <TextField
                    required
                    error={covidInfo.reporterName.error}
                    helperText={covidInfo.reporterName.errorMsg}
                    label="報告者氏名"
                    value={covidInfo.reporterName.value}
                    onChange={(event) => {inputChangeEvent('reporterName', event.target.value)}}
                />
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>区分</InputLabel>
                    <Select
                        value={covidInfo.kind.value}
                        defaultValue={"協働者"}
                        onChange={(event) => {inputChangeEvent('kind', event.target.value)}}
                        label="区分"
                    >
                        <MenuItem value={'協働者'}>協働者</MenuItem>
                        <MenuItem value={'社員'}>社員</MenuItem>
                    </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="PCR検査日"
                        value={covidInfo.pcrDate.value}
                        onChange={(newValue) => {inputChangeEvent('pcrDate', newValue)}}
                        renderInput={(params) => <TextField {...params}  
                        error={covidInfo.pcrDate.error}
                        helperText={covidInfo.pcrDate.errorMsg} />
                        }
                    />
                </LocalizationProvider>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>PCR検査結果</InputLabel>
                    <Select
                    value={covidInfo.pcrResult.value}
                    defaultValue={"未確定"}
                    onChange={(event) => {inputChangeEvent('pcrResult', event.target.value)}}
                    label="PCR検査結果"
                    >
                        <MenuItem value={'未確定'}>未確定</MenuItem>
                        <MenuItem value={'陽性'}>陽性</MenuItem>
                        <MenuItem value={'陰性'}>陰性</MenuItem>
                    </Select>
                </FormControl>

                {covidInfo.pcrResult.value == '未確定'
                ?
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="PCR検査結果予定日"
                        value={covidInfo.pcrResultScheduledDate.value}
                        onChange={(newValue) => {inputChangeEvent('pcrResultScheduledDate', newValue)}}
                        renderInput={(params) => <TextField {...params}
                            error={covidInfo.pcrResultScheduledDate.error}
                            helperText={covidInfo.pcrResultScheduledDate.errorMsg} />
                        }
                    />
                </LocalizationProvider>
                :
                <></>
                }

                <TextField
                    required
                    label="勤務地"
                    value={covidInfo.workLocation.value}
                    onChange={(event) => {inputChangeEvent('workLocation', event.target.value)}}
                    error={covidInfo.workLocation.error}
                    helperText={covidInfo.workLocation.errorMsg}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="最終出社日"
                        value={covidInfo.lastArrivalDate.value}
                        onChange={(newValue) => {inputChangeEvent('lastArrivalDate', newValue)}}
                        renderInput={(params) => <TextField {...params}
                            error={covidInfo.lastArrivalDate.error}
                            helperText={covidInfo.lastArrivalDate.errorMsg} />
                        }
                    />
                </LocalizationProvider>
                <TextField
                    required
                    label="最終出社フロア"
                    value={covidInfo.lastArrivalLocation.value}
                    onChange={(event) => {inputChangeEvent('lastArrivalLocation', event.target.value)}}
                    error={covidInfo.lastArrivalLocation.error}
                    helperText={covidInfo.lastArrivalLocation.errorMsg}
                />
                <TextField
                    label="濃厚接触者"
                    type="number"
                    InputLabelProps={{
                    shrink: true,
                    }}
                    variant="standard"
                    value={covidInfo.closeContacts.value}
                    onChange={(event) => {inputChangeEvent('closeContacts', event.target.value)}}
                    error={covidInfo.closeContacts.error}
                    helperText={covidInfo.closeContacts.errorMsg}
                />
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <h1>aaaaa</h1>
                <Button
                    onClick={submitEvent}
                >
                    送信
                </Button>
            </Stack>
        </FormRoot>
    )
}

const FormRoot = styled.div`
    padding-left: 100px;
    padding-top: 20px;
`

export default Form