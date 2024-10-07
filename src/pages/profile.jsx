import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import InfoRow from '@arcblock/ux/lib/InfoRow';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Tag from '@arcblock/ux/lib/Tag';
import DID from '@arcblock/ux/lib/DID';
import uniqBy from 'lodash/uniqBy';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useSessionContext } from '../libs/session';
import api from '../libs/api';
import { useForm } from 'react-hook-form';
import pick from 'lodash/pick';

const formatToDatetime = (date) => {
  if (!date) {
    return '-';
  }

  return dayjs(date).format('YYYY-MM-DD hh:mm:ss');
};

export default function Main() {
  const { session } = useSessionContext();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });
  const updateProfile = data => {
    api.put('/api/user', {
      ...data,
      gender: data.gender || user.gender,
      did: user.did,
    }).then(() => {
      setIsEditing(false);
      getData();
    });
  };

  // function t to translate the text
  const { t } = useLocaleContext();
  const { preferences } = window.blocklet;

  useEffect(() => {
    getData();
  }, [session.user]); //eslint-disable-line

  useEffect(() => {
    reset(pick(user, ['name', 'gender', 'email', 'phone']));
  }, [user]);

  const getData = () => {
    api
      .get('/api/user')
      .then((res) => {
        setUser(res);
        setLoading(false);
      }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const rows = !!user
    ? [
      {
        name: t('name'),
        value: <Box display="flex" alignItems="center" gap={2}><Avatar src={user.avatar} />{user.name}</Box>,
      },
      preferences.displayAvatar ? { name: t('avatar'), value: <Avatar alt="" src={user.avatar}></Avatar> } : null,
      { name: t('did'), value: <DID did={user.did} showQrcode locale="zh" /> },
      { name: t('email'), value: user.email },
      { name: t('phone'), value: user.phone },
      { name: t('gender'), value: t(user.gender) },
      {
        name: t('passports'),
        value: user.passports ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {uniqBy(user.passports, 'name').map((passport) => (
              <Tag key={passport.name} type={passport.name === 'owner' ? 'success' : 'primary'}>
                {passport.title}
              </Tag>
            ))}
          </Box>
        ) : (
          '--'
        ),
      },
      {
        name: t('role'),
        value: <Tag type={user.role === 'owner' ? 'success' : 'primary'}>{user.role}</Tag>,
      },
      { name: t('lastLogin'), value: formatToDatetime(user.updatedAt) },
      { name: t('createdAt'), value: formatToDatetime(user.createdAt) },
    ].filter(Boolean)
    : [];

  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Stack className="container" sx={{ width: '80%', mt: 8 }}>
      {!user && (
        <Box
          sx={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#888',
            py: 5,
          }}>
          <Typography>
            You are not logged in yet! {preferences.welcome}
          </Typography>
          <Button
            onClick={() => session.login()}
            style={{ marginTop: 16, textTransform: 'none' }}
            variant="contained"
            color="primary">
            Login
          </Button>
        </Box>
      )}
      {!!user && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '&>div': {
              mb: 0,
            },
            '.info-row__name': {
              fontWeight: 'bold',
              color: 'grey.800',
            },
          }}>
          <Typography variant="h3" mb={3}>
            {t('profile')}
          </Typography>
          {
            !isEditing ?
              <>
                {rows.map((row) => {
                  if (row.name === t('did')) {
                    return (
                      <InfoRow
                        valueComponent="div"
                        key={row.name}
                        nameWidth={120}
                        name={row.name}
                        nameFormatter={() => t('did')}>
                        {row.value}
                      </InfoRow>
                    );
                  }

                  return (
                    <InfoRow valueComponent="div" key={row.name} nameWidth={120} name={row.name}>
                      {row.value}
                    </InfoRow>
                  );
                })}
                <Button onClick={() => setIsEditing(true)}>{t('Edit')}</Button>
              </>
              :
              <form onSubmit={handleSubmit(updateProfile)}>
                <FormGroup>
                  <TextField
                    required
                    label={t('name')}
                    error={Boolean(errors?.name)}
                    {...register('name', {
                      required: 'name is required',
                    })}
                    autoFocus
                  />

                  <FormControl margin="normal">
                    <FormLabel>{t('gender')}</FormLabel>
                    <RadioGroup value={user.gender} onChange={(event, value) => {
                      setUser({
                        ...user,
                        gender: value
                      })
                      setValue('gender', value);
                    }}>
                      <FormControlLabel value="female" control={<Radio {...register('gender')} />}
                                        label={t('female')} />
                      <FormControlLabel value="male" control={<Radio {...register('gender')} />} label={t('male')} />
                    </RadioGroup>
                  </FormControl>

                  <FormControl margin="normal">
                    <TextField
                      label={t('phone')}
                      {...register('phone', {
                        pattern: {
                          value: /\d{11}/,
                          message: 'Entered value does not match phone format',
                        },
                      })}
                      error={Boolean(errors?.phone)}
                    />
                  </FormControl>

                  <FormControl margin="normal">
                    <TextField
                      label={t('email')}
                      {...register('email', {
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Entered value does not match email format',
                        },
                      })}
                      error={Boolean(errors?.email)}
                    />
                  </FormControl>
                </FormGroup>


                <Button type="submit" variant="contained">{t('Save')}</Button>&nbsp;
                <Button variant="outlined" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
              </form>
          }
        </Box>
      )}
      <ToastContainer />
    </Stack>
  );
}
