import { Checkbox, FormControl, FormControlLabel, FormGroup, Radio, RadioGroup, Stack, Box } from "@mui/material";
import { ChangeEvent } from "react";

type customerFilterProps = {
    allRecord: number;
    businessRecord: number;
    unBusinessRecord: number;
    partnerRecord: number;
    retailRecord: number;
    filterState: boolean | null;
    onChangeState: (value: boolean | null) => void;
    isPartner: boolean | null;
    onCheck: (value: boolean | null) => void;
}

export function CustomerFilter({
    allRecord,
    businessRecord,
    unBusinessRecord,
    partnerRecord,
    retailRecord,
    filterState,
    onChangeState,
    onCheck,
    isPartner }: customerFilterProps) {
    const currentValue = filterState === true ? 'business' : (filterState === false ? 'personal' : 'all');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === 'business') {
            onChangeState(true);
        } else if (val === 'personal') {
            onChangeState(false);
        } else {
            onChangeState(null);
        }
    };

    const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "partner";
        const checked = e.target.checked;

        if (!checked) {
            onCheck(null);
            return;
        }

        onCheck(value);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={3} border="1px solid #ddd" borderRadius={1} pl={1}>
                <FormControl>
                    <RadioGroup
                        row
                        name="customer-filter-group"
                        value={currentValue}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="all" control={<Radio />} label={`Tất cả khách hàng (${allRecord})`} />
                        <FormControlLabel value="business" control={<Radio />} label={`Doanh nghiệp (${businessRecord ?? 0})`} />
                        <FormControlLabel value="personal" control={<Radio />} label={`Cá nhân (${unBusinessRecord ?? 0})`} />
                    </RadioGroup>
                </FormControl>
            </Stack>
            <FormGroup sx={{ flexDirection: "row" }}>
                <FormControlLabel
                    value="partner"
                    label={`Đối tác (${partnerRecord})`}
                    control={
                        <Checkbox
                            checked={isPartner === true}
                            onChange={handleCheck}
                        />
                    }
                />

                <FormControlLabel
                    value="retail"
                    label={`Khách lẻ (${retailRecord})`}
                    control={
                        <Checkbox
                            checked={isPartner === false}
                            onChange={handleCheck}
                        />
                    }
                />
            </FormGroup>
        </Box>
    );
}